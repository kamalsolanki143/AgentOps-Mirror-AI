from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.persona import Persona
from app.schemas.persona import PersonaCreate, PersonaUpdate


class PersonaService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: int, req: PersonaCreate) -> Persona:
        persona = Persona(
            user_id=user_id,
            name=req.name,
            slug=req.slug or req.name.lower().replace(" ", "-"),
            category=req.category,
            language=req.language,
            difficulty=req.difficulty,
            description=req.description,
            personality=req.personality,
            goal=req.goal.model_dump(by_alias=True) if req.goal else {},
            sample_opener=req.sample_opener,
            tags=req.tags,
            color=req.color,
            emoji=req.emoji,
            success_rate=req.success_rate,
            is_built_in=req.is_built_in,
            
            persona_type=req.persona_type,
            behavior_description=req.behavior_description,
            attack_style=req.attack_style,
            traits=req.traits,
        )
        self.db.add(persona)
        await self.db.commit()
        await self.db.refresh(persona)
        return persona

    async def get_by_id(self, persona_id: int) -> Persona | None:
        result = await self.db.execute(select(Persona).where(Persona.id == persona_id))
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id: int, skip: int = 0, limit: int = 100) -> list[Persona]:
        result = await self.db.execute(
            select(Persona).where(Persona.user_id == user_id).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def count_by_user(self, user_id: int) -> int:
        result = await self.db.execute(
            select(func.count(Persona.id)).where(Persona.user_id == user_id)
        )
        return result.scalar_one()

    async def update(self, persona_id: int, req: PersonaUpdate) -> Persona | None:
        persona = await self.get_by_id(persona_id)
        if not persona:
            return None
        update_data = req.model_dump(exclude_unset=True)
        if "goal" in update_data and update_data["goal"] is not None:
            update_data["goal"] = req.goal.model_dump(by_alias=True)
            
        for key, value in update_data.items():
            setattr(persona, key, value)
        await self.db.commit()
        await self.db.refresh(persona)
        return persona

    async def delete(self, persona_id: int) -> bool:
        persona = await self.get_by_id(persona_id)
        if not persona:
            return False
        await self.db.delete(persona)
        await self.db.commit()
        return True

