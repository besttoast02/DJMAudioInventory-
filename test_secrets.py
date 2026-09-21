import toml; secrets = toml.load(".streamlit/secrets.toml"); print("TOKEN:", secrets.get("TELEGRAM_BOT_TOKEN", ""))
