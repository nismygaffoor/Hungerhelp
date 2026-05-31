from datetime import datetime
from bson import ObjectId
from db import db


class Feedback:
    collection = db['feedback']

    @staticmethod
    def create(data):
        doc = {
            'user_id': ObjectId(data['user_id']) if isinstance(data['user_id'], str) else data['user_id'],
            'user_name': data.get('user_name', ''),
            'user_role': data.get('user_role', ''),
            'category': data.get('category', 'Other'),
            'rating': int(data['rating']),
            'message': data.get('message', '').strip(),
            'created_at': datetime.utcnow(),
        }
        result = Feedback.collection.insert_one(doc)
        return str(result.inserted_id)

    @staticmethod
    def get_by_user(user_id):
        query = {
            '$or': [
                {'user_id': ObjectId(user_id)},
                {'user_id': user_id},
            ]
        }
        cursor = Feedback.collection.find(query).sort('created_at', -1)
        items = []
        for doc in cursor:
            items.append(Feedback.serialize(doc))
        return items

    @staticmethod
    def get_all(role_filter=None):
        query = {}
        if role_filter:
            query['user_role'] = role_filter
        cursor = Feedback.collection.find(query).sort('created_at', -1)
        items = []
        for doc in cursor:
            items.append(Feedback.serialize(doc))
        return items

    @staticmethod
    def get_stats():
        pipeline = [
            {
                '$group': {
                    '_id': '$user_role',
                    'count': {'$sum': 1},
                    'avg_rating': {'$avg': '$rating'},
                }
            }
        ]
        by_role = {}
        for row in Feedback.collection.aggregate(pipeline):
            by_role[row['_id']] = {
                'count': row['count'],
                'avg_rating': round(row['avg_rating'], 1) if row.get('avg_rating') else 0,
            }

        total = Feedback.collection.count_documents({})
        avg = Feedback.collection.aggregate([{'$group': {'_id': None, 'avg': {'$avg': '$rating'}}}])
        avg_rating = 0
        for row in avg:
            avg_rating = round(row['avg'], 1) if row.get('avg') else 0

        return {
            'total': total,
            'avg_rating': avg_rating,
            'by_role': by_role,
        }

    @staticmethod
    def serialize(doc):
        created_at = doc.get('created_at')
        return {
            'id': str(doc['_id']),
            'user_id': str(doc.get('user_id', '')),
            'user_name': doc.get('user_name', ''),
            'user_role': doc.get('user_role', ''),
            'category': doc.get('category', ''),
            'rating': doc.get('rating', 0),
            'message': doc.get('message', ''),
            'created_at': created_at.isoformat() if created_at else None,
        }
