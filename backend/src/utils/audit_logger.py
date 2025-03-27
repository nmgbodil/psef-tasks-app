import logging

logger = logging.getLogger("audit_logger")
handler = logging.FileHandler("audit.log")
formatter = logging.Formatter("%(asctime)s - %(user_id)s - %(action)s - %(data)s")
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

def log_action(user_id, action, data):
    logger.info("", extra={"user_id": user_id, "action": action, "data": data})
