fn main() {
    if let Err(error) = potatos_lib::run_cli_app(std::env::args().collect()) {
        eprintln!("{error}");
        std::process::exit(1);
    }
}
