<<<<<<< HEAD
﻿from pydantic import BaseModel, EmailStr, Field

=======
from pydantic import BaseModel, EmailStr, Field
>>>>>>> 7e5c60799465a71038c34171682412c1987d72a5

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class Token(BaseModel):
    access_token: str
    token_type: str
<<<<<<< HEAD
=======
    
>>>>>>> 7e5c60799465a71038c34171682412c1987d72a5
