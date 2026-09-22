#[cfg(target_os = "android")]
use jni::objects::{JClass, JObject, JValue};

/// Resolves an application Java class through the app's own `ClassLoader`
/// (`getApplicationContext().getClassLoader().loadClass(name)`).
///
/// This is the robust way to look up overlay classes on Android: plain
/// `JNI.FindClass` resolves through the "current thread context" class
/// loader, which frequently cannot see application classes, producing an
/// opaque ClassNotFoundException. Loading through the Activity's classloader
/// always finds classes packaged in the APK.
#[cfg(target_os = "android")]
pub(crate) fn load_app_class(
    env: &mut jni::JNIEnv<'_>,
    activity: &jni::objects::JObject<'_>,
    name: &str,
) -> Result<JClass<'static>, String> {
    let name_obj: JObject = env.new_string(name).map_err(|e| e.to_string())?.into();
    let context = env
        .call_method(activity, "getApplicationContext", "()Landroid/content/Context;", &[])
        .map_err(|e| format!("JNI getApplicationContext: {}", e))?
        .l()
        .map_err(|e| e.to_string())?;
    let loader = env
        .call_method(&context, "getClassLoader", "()Ljava/lang/ClassLoader;", &[])
        .map_err(|e| format!("JNI getClassLoader: {}", e))?
        .l()
        .map_err(|e| e.to_string())?;
    let class_obj = env
        .call_method(
            &loader,
            "loadClass",
            "(Ljava/lang/String;)Ljava/lang/Class;",
            &[JValue::Object(&name_obj)],
        )
        .map_err(|e| format!("JNI loadClass({}): {}", name, e))?
        .l()
        .map_err(|e| e.to_string())?;
    if class_obj.is_null() {
        return Err(format!("JNI loadClass({}): returned null", name));
    }
    let raw = class_obj.as_raw() as jni::sys::jclass;
    Ok(unsafe { JClass::from_raw(raw) })
}

/// Reads the message of the currently-pending Java exception (if any) and
/// clears it, so the exact failure text can be shown in the UI.
#[cfg(target_os = "android")]
pub(crate) fn exception_message(env: &mut jni::JNIEnv<'_>) -> Option<String> {
    use jni::objects::JString;
    let throwable = match env.exception_occurred().ok()? {
        t if t.is_null() => return None,
        t => t,
    };
    let obj: jni::objects::JObject = throwable.into();
    let text = env
        .call_method(&obj, "toString", "()Ljava/lang/String;", &[])
        .ok()
        .and_then(|v| v.l().ok())
        .and_then(|o| {
            let s = JString::from(o);
            env.get_string(&s).ok().and_then(|js| js.to_str().ok().map(|x| x.to_owned()))
        });
    let _ = env.exception_clear();
    text
}