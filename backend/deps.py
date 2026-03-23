import jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

import models
import utils
from database import get_db


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, utils.SECRET_KEY, algorithms=[utils.ALGORITHM])
        email: str = payload.get("sub")
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            raise HTTPException(status_code=401, detail="Невалидный токен")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Невалидный токен")
