from datetime import datetime

from models.food_post import FoodPost

_last_recurring_date = None


def process_recurring_donations():
    """
    Find active recurring templates scheduled for today and create
    one Available food post instance for each (if not already created today).
    """
    today_day = datetime.now().strftime('%A')
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    query = {
        "is_recurring": True,
        "status": "Active",
        "day": today_day,
    }

    recurring_templates = list(FoodPost.collection.find(query))
    created = 0
    skipped = 0
    errors = 0

    for template in recurring_templates:
        try:
            existing_instance = FoodPost.collection.find_one({
                "parent_recurring_id": template['_id'],
                "created_at": {"$gte": today_start},
            })

            if existing_instance:
                skipped += 1
                continue

            instance_data = {
                "donor_id": template['donor_id'],
                "food_type": template['food_type'],
                "quantity": template.get('quantity', ''),
                "location": template.get('location', ''),
                "district": template.get('district', ''),
                "home_address": template.get('home_address', template.get('home_no', '')),
                "city": template.get('city', template.get('road', '')),
                "description": f"(Scheduled) {template.get('description', '')}".strip(),
                "images": template.get('images', []),
                "items": template.get('items', []),
                "status": "Available",
                "is_recurring": False,
                "is_urgent": template.get('is_urgent', False),
                "parent_recurring_id": template['_id'],
                "destination_type": template.get('destination_type', ""),
                "destination_name": template.get('destination_name', ""),
                "frequency": template.get('frequency', ""),
                "day": template.get('day', ''),
                "expiry_time": datetime.utcnow().replace(hour=23, minute=59, second=59).isoformat(),
                "created_at": datetime.utcnow(),
            }

            FoodPost.collection.insert_one(instance_data)
            created += 1
        except Exception:
            errors += 1

    return {
        "day": today_day,
        "templates": len(recurring_templates),
        "created": created,
        "skipped": skipped,
        "errors": errors,
    }


def maybe_process_recurring():
    """Run recurring processing at most once per calendar day per server process."""
    global _last_recurring_date
    today = datetime.now().strftime('%Y-%m-%d')
    if _last_recurring_date == today:
        return {"skipped": True, "reason": "already_ran_today"}
    _last_recurring_date = today
    return process_recurring_donations()
