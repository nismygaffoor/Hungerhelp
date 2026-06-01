from flask import Blueprint, request

sms_bp = Blueprint("sms", __name__)


@sms_bp.route("/incoming", methods=["POST"])
def incoming_sms():
    """Twilio webhook for inbound SMS (claim by text)."""
    from_number = request.form.get("From", "")
    body = request.form.get("Body", "")

    from services.sms_claim import handle_inbound_sms

    reply = handle_inbound_sms(from_number, body)

    from twilio.twiml.messaging_response import MessagingResponse

    response = MessagingResponse()
    response.message(reply)
    return str(response), 200, {"Content-Type": "text/xml"}
