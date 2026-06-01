def build_location_address(district='', home_address='', city=''):
    parts = []
    if district:
        parts.append(district.strip())
    if home_address:
        parts.append(home_address.strip())
    if city:
        parts.append(city.strip())
    return ', '.join(parts)


def _apply_structured_fields(data):
    """Read structured fields, supporting legacy home_no/road keys."""
    district = (data.get('district') or '').strip()
    home_address = (data.get('home_address') or data.get('home_no') or '').strip()
    city = (data.get('city') or data.get('road') or '').strip()
    return district, home_address, city


def normalize_location_data(data):
    """Apply structured location fields and build the legacy location string."""
    district, home_address, city = _apply_structured_fields(data)
    pickup_times = (data.get('pickup_times') or '').strip()

    if district:
        data['district'] = district
        data['home_address'] = home_address
        data['city'] = city

        address = build_location_address(district, home_address, city)
        if pickup_times:
            data['location'] = f"{address} | {pickup_times}"
        elif 'location' not in data or not str(data.get('location', '')).strip():
            data['location'] = address
        elif ' | ' in str(data.get('location', '')):
            _, existing_times = str(data['location']).split(' | ', 1)
            data['location'] = f"{address} | {existing_times.strip()}"

    return data


def get_user_delivery_address(user, fallback='Address not set'):
    """Resolve a user's delivery address from stored profile fields."""
    if not user:
        return fallback
    address = (user.get('address') or '').strip()
    if address:
        return address
    district, home_address, city = _apply_structured_fields(user)
    built = build_location_address(district, home_address, city)
    return built or fallback


def normalize_user_address(data):
    """Build user address from structured fields."""
    district, home_address, city = _apply_structured_fields(data)

    if district or home_address or city:
        data['district'] = district
        data['home_address'] = home_address
        data['city'] = city
        if district:
            data['address'] = build_location_address(district, home_address, city)

    return data
