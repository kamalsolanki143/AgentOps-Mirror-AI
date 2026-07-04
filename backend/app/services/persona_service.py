from sqlalchemy import select
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
            persona_type=req.persona_type,
            language=req.language,
            difficulty=req.difficulty,
            goal=req.goal,
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

    async def update(self, persona_id: int, req: PersonaUpdate) -> Persona | None:
        persona = await self.get_by_id(persona_id)
        if not persona:
            return None
        update_data = req.model_dump(exclude_unset=True)
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
