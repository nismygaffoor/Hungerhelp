"""Run recurring donation processing — creates daily food post instances from templates.

Usage (manual):
  cd backend
  python scripts/process_recurring.py

Also runs automatically when the backend handles food/donor requests (once per day).
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.recurring_processor import process_recurring_donations

if __name__ == "__main__":
    result = process_recurring_donations()
    print("Recurring donation result:", result)
