from datetime import datetime
from bson import ObjectId
from db import db


class ContactMessage:
    collection = db['contact_messages']

    VALID_STATUSES = ('new', 'read', 'replied')

    @staticmethod
    def create(data):
        doc = {
            'name': data.get('name', '').strip(),
            'email': data.get('email', '').strip().lower(),
            'subject': data.get('subject', '').strip(),
            'message': data.get('message', '').strip(),
            'status': 'new',
            'user_id': data.get('user_id'),
            'created_at': datetime.utcnow(),
        }
        result = ContactMessage.collection.insert_one(doc)
        return str(result.inserted_id)

    @staticmethod
    def get_all(status_filter=None):
        query = {}
        if status_filter and status_filter in ContactMessage.VALID_STATUSES:
            query['status'] = status_filter
        cursor = ContactMessage.collection.find(query).sort('created_at', -1)
        return [ContactMessage.serialize(doc) for doc in cursor]

    @staticmethod
    def get_stats():
        total = ContactMessage.collection.count_documents({})
        new_count = ContactMessage.collection.count_documents({'status': 'new'})
        read_count = ContactMessage.collection.count_documents({'status': 'read'})
        replied_count = ContactMessage.collection.count_documents({'status': 'replied'})
        return {
            'total': total,
            'new': new_count,
            'read': read_count,
            'replied': replied_count,
        }

    @staticmethod
    def update_status(message_id, status):
        if status not in ContactMessage.VALID_STATUSES:
            return False
        result = ContactMessage.collection.update_one(
            {'_id': ObjectId(message_id)},
            {'$set': {'status': status, 'updated_at': datetime.utcnow()}},
        )
        return result.modified_count > 0

    @staticmethod
    def serialize(doc):
        created_at = doc.get('created_at')
        updated_at = doc.get('updated_at')
        user_id = doc.get('user_id')
        return {
            'id': str(doc['_id']),
            'name': doc.get('name', ''),
            'email': doc.get('email', ''),
            'subject': doc.get('subject', ''),
            'message': doc.get('message', ''),
            'status': doc.get('status', 'new'),
            'user_id': str(user_id) if user_id else None,
            'created_at': created_at.isoformat() if created_at else None,
            'updated_at': updated_at.isoformat() if updated_at else None,
        }
