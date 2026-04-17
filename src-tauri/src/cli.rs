use crate::db::{create_todo, delete_todo, list_todos, update_todo, TodoPayload};

pub fn run_cli(args: Vec<String>) -> Result<(), String> {
    if args.len() < 2 {
        print_usage();
        return Ok(());
    }

    match args[1].as_str() {
        "add" => handle_add(&args[2..]),
        "ls" => handle_list(),
        "rm" => handle_remove(&args[2..]),
        "update" => handle_update(&args[2..]),
        _ => {
            print_usage();
            Ok(())
        }
    }
}

fn handle_add(args: &[String]) -> Result<(), String> {
    let payload = parse_payload(args, false)?;
    let todo = create_todo(payload)?;
    println!("created {}", todo.id);
    Ok(())
}

fn handle_list() -> Result<(), String> {
    let todos = list_todos()?;

    if todos.is_empty() {
        println!("no todos");
        return Ok(());
    }

    for todo in todos {
        println!(
            "{} | {} | {} | {} | completed={}",
            todo.id, todo.title, todo.start_time, todo.description, todo.completed
        );
    }

    Ok(())
}

fn handle_remove(args: &[String]) -> Result<(), String> {
    let id = match args.first() {
        Some(id) => id,
        None => {
            println!("Error: missing task ID");
            println!("Usage: potatos rm <ID>");
            println!("Example:");
            println!("  potatos-cli rm e53ceb50-874f-4538-a722-6aaae00a5e5c");
            return Ok(());
        }
    };
    delete_todo(id)?;
    println!("removed {}", id);
    Ok(())
}

fn handle_update(args: &[String]) -> Result<(), String> {
    let id = match args.first() {
        Some(id) => id,
        None => {
            println!("Error: missing task ID");
            println!("Usage: potatos-cli update <id> <OPTIONS>");
            println!("    --title, -t       <title>          Update task title");
            println!("    --description, -d <description>    Update task description");
            println!("    --start_time, -time <utf_time>     Update start time");
            return Ok(());
        }
    };
    let payload = parse_payload(&args[1..], false)?;
    let todo = update_todo(id, payload)?;
    println!("updated {}", todo.id);
    Ok(())
}

fn parse_payload(args: &[String], _allow_partial: bool) -> Result<TodoPayload, String> {
    let mut title = String::new();
    let mut description = String::new();
    let mut start_time = String::new();
    let mut notify_before_minutes = 0_i64;

    let mut index = 0;
    while index < args.len() {
        match args[index].as_str() {
            "--title" | "-t" => {
                title = take_value(args, &mut index, "title")?;
            }
            "--description" | "-d" => {
                description = take_value(args, &mut index, "description")?;
            }
            "--start_time" | "-time" => {
                start_time = take_value(args, &mut index, "start_time")?;
            }
            "--notify_before" | "-n" => {
                let value = take_value(args, &mut index, "notify_before")?;
                notify_before_minutes =
                    value.parse::<i64>().map_err(|_| "invalid notify_before")?;
            }
            flag => return Err(format!("unknown flag: {flag}")),
        }
        index += 1;
    }

    if title.trim().is_empty() || start_time.trim().is_empty() {
        return Err("title and start_time are required".to_string());
    }

    Ok(TodoPayload {
        title,
        description,
        start_time,
        notify_before_minutes,
    })
}

fn take_value(args: &[String], index: &mut usize, field_name: &str) -> Result<String, String> {
    let value_index = *index + 1;
    if value_index >= args.len() {
        return Err(format!("missing value for {field_name}"));
    }

    *index = value_index;
    Ok(args[value_index].clone())
}

fn print_usage() {
    println!("Usage:");
    println!("  potatos-cli add <OPTIONS>");
    println!("    --title, -t       <title>          Task title");
    println!("    --description, -d <description>    Task description");
    println!("    --start_time, -time <utf_time>     Start time in UTC");
    println!();
    println!("  potatos-cli ls");
    println!("    List all tasks");
    println!();
    println!("  potatos-cli rm <id>");
    println!("    Remove task by ID");
    println!();
    println!("  potatos-cli update <id> <OPTIONS>");
    println!("    --title, -t       <title>          Update task title");
    println!("    --description, -d <description>    Update task description");
    println!("    --start_time, -time <utf_time>     Update start time");
}
