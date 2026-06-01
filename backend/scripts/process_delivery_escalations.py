"""Run delivery escalation checks (volunteer reminder + escalate to all parties).

Usage:
  cd backend
  python scripts/process_delivery_escalations.py

Schedule every 5–15 minutes via cron or Task Scheduler.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.delivery_escalation import process_delivery_escalations

if __name__ == "__main__":
    result = process_delivery_escalations()
    print("Delivery escalation result:", result)
