"""
Seed Data Endpoint
种子数据初始化接口
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.user import User
from app.models.ticket import Ticket

router = APIRouter()


@router.post("")
async def seed_data(db: Session = Depends(get_db)):
    """
    初始化种子数据
    包括创建测试用户和工单数据
    """
    # 检查是否已有数据
    existing_users = db.query(User).count()
    if existing_users > 0:
        return {"message": "Database already seeded", "skipped": True}

    # 创建测试用户
    test_users = [
        User(
            id="TECH-8821",
            username="mike.tech",
            email="mike@igreenplus.com",
            hashed_password=get_password_hash("password"),
            name="Mike Technician",
            phone="+1 (555) 123-4567",
            group="Bangkok Operations (Zone A)",
            language="en",
            is_active=True,
            is_admin=False,
        ),
        User(
            id="TECH-8822",
            username="admin",
            email="admin@igreenplus.com",
            hashed_password=get_password_hash("admin123"),
            name="Administrator",
            phone="+1 (555) 999-9999",
            group="Management",
            language="en",
            is_active=True,
            is_admin=True,
        ),
    ]

    for user in test_users:
        db.add(user)

    # 创建测试工单
    test_tickets = [
        Ticket(
            id="WO-2024",
            title="Station #405 Offline - Downtown Plaza",
            description="Station is reporting offline status for more than 2 hours. Remote reset failed. Likely network module issue or power cut.",
            status="open",
            priority="critical",
            type="corrective",
            requester="System Monitor",
            location="Downtown Plaza, Bay 4",
            tags=["offline", "network", "urgent"],
            steps_data=[
                {"id": "1", "label": "Initial Inspection", "completed": False},
                {"id": "2", "label": "Check Power Supply", "completed": False},
                {"id": "3", "label": "Network Diagnostic", "completed": False},
                {"id": "4", "label": "Module Replacement", "completed": False},
                {"id": "5", "label": "Final Verification", "completed": False},
            ]
        ),
        Ticket(
            id="WO-2025",
            title="Connector B Damage - Highway Rest Stop 12",
            description="Customer reported CCS connector locking mechanism is broken. Visual inspection required. Spare part #CCS-Type2-L might be needed.",
            status="assigned",
            priority="high",
            type="corrective",
            requester="Customer Report",
            assignee_id="TECH-8821",
            assignee_name="Mike Technician",
            location="Highway 101, Rest Stop 12",
            tags=["hardware", "connector", "safety"],
            steps_data=[
                {"id": "1", "label": "Visual Assessment", "completed": False},
                {"id": "2", "label": "Lock Mechanism Test", "completed": False},
                {"id": "3", "label": "Replace Connector Head", "completed": False},
                {"id": "4", "label": "Safety Check", "completed": False},
            ]
        ),
        Ticket(
            id="WO-2026",
            title="Routine Maintenance - Mall of City (Level 2)",
            description="Quarterly preventive maintenance for cluster A. Check cables, clean screens, test voltage output.",
            status="open",
            priority="medium",
            type="preventive",
            requester="Ops Manager",
            location="Mall of City, P2 Green Zone",
            tags=["maintenance", "routine"],
            steps_data=[
                {"id": "1", "label": "Check the MDB cabinet and charging station cabinet for rust,leaks, and the condition of the door handles.", "completed": False},
                {"id": "2", "label": "Check the fire extinguishers and monitor the equipment to ensure they are functioning properly.", "completed": False},
                {"id": "3", "label": "Check the ground condition, drainage, and cleaning.", "completed": False},
                {"id": "4", "label": "Check the charging gun head and charging cable for any damage or scratches. Ensure the cable ends are securely installed.", "completed": False},
                {"id": "5", "label": "Check if the charging input line is normal.", "completed": False},
                {"id": "6", "label": "Check that all terminals on the charging station's mainboard are securely plugged in and that all cables are loose.", "completed": False},
                {"id": "7", "label": "Check if the display screen is intact and verify that all parameter settings are correct.", "completed": False},
                {"id": "8", "label": "Check if the indicator lights on the charging station are functioning properly.", "completed": False},
                {"id": "9", "label": "Check if all communication functions of the charging station are normal.", "completed": False},
                {"id": "10", "label": "Check that the emergency stop button is intact and that it functions properly.", "completed": False},
                {"id": "11", "label": "Check if the charging module is operating normally and if the power indicator light is flashing. There should be no red alarm light illuminated.", "completed": False},
                {"id": "12", "label": "Check that the surge protector is in good working order and has not been damaged.", "completed": False},
                {"id": "13", "label": "Check if the dust screen needs cleaning.", "completed": False},
                {"id": "14", "label": "Check all historical records of the charging station for any abnormal fault data.", "completed": False},
                {"id": "15", "label": "Check if the communication between the charging station and the backend is normal and if the data is being sent normally.", "completed": False},
                {"id": "16", "label": "Check if the charger contactor is functioning properly and On-site test of charging action.", "completed": False},
            ]
        ),
        Ticket(
            id="WO-2027",
            title="Scheduled Modem Upgrade - Westside Park",
            description="Replace 3G modems with 4G LTE units for Stations 1-4 as part of the Q4 connectivity upgrade plan.",
            status="open",
            priority="medium",
            type="planned",
            requester="Network Planning",
            location="Westside Park, Stations 1-4",
            tags=["upgrade", "connectivity", "planned"],
            steps_data=[
                {"id": "1", "label": "Remove Old Modem", "completed": False},
                {"id": "2", "label": "Install 4G Unit", "completed": False},
                {"id": "3", "label": "Signal Test", "completed": False},
            ]
        ),
        Ticket(
            id="WO-2028",
            title="Payment Terminal Jammed - Central Station",
            description="Credit card reader is not accepting cards. Physical obstruction detected in the slot.",
            status="open",
            priority="low",
            type="corrective",
            requester="Site Security",
            location="Central Station, Main Entrance",
            tags=["payment", "hardware"],
            steps_data=[
                {"id": "1", "label": "Inspect Slot", "completed": False},
                {"id": "2", "label": "Remove Obstruction", "completed": False},
                {"id": "3", "label": "Test Card Read", "completed": False},
            ]
        ),
        Ticket(
            id="WO-2029",
            title="Recurring Power Fluctuation - Sector 7",
            description="Multiple users reporting power output instability. Requires deep analysis and long-term monitoring strategy.",
            status="assigned",
            priority="high",
            type="problem",
            requester="Regional Director",
            assignee_id="TECH-8821",
            assignee_name="Mike Technician",
            location="Sector 7, Industrial Zone",
            tags=["power", "investigation"],
            related_ticket_id="WO-2024"
        ),
    ]

    for ticket in test_tickets:
        db.add(ticket)

    # 提交所有数据
    db.commit()

    return {
        "message": "Database seeded successfully",
        "users_created": len(test_users),
        "tickets_created": len(test_tickets)
    }
