use std::fs;
use std::path::PathBuf;

fn get_app_dir() -> Result<PathBuf, String> {
    let base_dir = dirs::data_local_dir().ok_or("unable to locate local data directory")?;
    let app_dir = base_dir.join("potatos");
    fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    Ok(app_dir)
}

pub fn is_first() -> Result<bool, String> {
    let app_dir = get_app_dir()?;

    let first_file = app_dir.join(".first");
    Ok(!first_file.exists())
}

pub fn set_first() -> Result<(), String> {
    let app_dir = get_app_dir()?;

    let first_file = app_dir.join(".first");
    fs::File::create(&first_file).map_err(|e| e.to_string())?;
    Ok(())
}
