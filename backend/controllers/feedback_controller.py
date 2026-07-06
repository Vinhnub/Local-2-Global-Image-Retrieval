from sqlalchemy.orm import Session
from fastapi import HTTPException
from backend.models.domain import User, QueryHistory, Feedback
from backend.models.feedback_schemas import FeedbackCreate

class FeedbackController:
    def submit_feedback(self, db: Session, current_user: User, feedback_data: FeedbackCreate):
        # Kiểm tra xem query có tồn tại và thuộc về user này hay không
        query = db.query(QueryHistory).filter(QueryHistory.id == feedback_data.query_id).first()
        if not query:
            raise HTTPException(status_code=404, detail="Không tìm thấy lịch sử query này")
            
        if query.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Bạn không có quyền đánh giá kết quả của người khác")
            
        # Kiểm tra xem đã đánh giá chưa
        existing_feedback = db.query(Feedback).filter(Feedback.query_id == query.id).first()
        if existing_feedback:
            raise HTTPException(status_code=400, detail="Bạn đã đánh giá query này rồi")
            
        new_feedback = Feedback(
            query_id=query.id,
            rating=feedback_data.rating,
            comment=feedback_data.comment
        )
        db.add(new_feedback)
        db.commit()
        
        return {"status": "success", "message": "Cảm ơn bạn đã gửi đánh giá!"}

feedback_controller = FeedbackController()
