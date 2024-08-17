import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FIREBASE_APP } from 'notification/utils/providers/firebase-admin.provider';
import { User } from 'notification/entities/classes/user.entity';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';

@Injectable()
export class FirebaseAuthStrategy extends PassportStrategy(Strategy, "bearer") {
    constructor(
        @Inject(FIREBASE_APP) private readonly firebaseApp: firebase.app.App,
        @InjectRepository(User) private readonly usersRepository: Repository<User>
    ) {
        super();
    }

    async validate(token: string): Promise<User> {
        try {
            const tokenDecoded = await this.firebaseApp.auth().verifyIdToken(token);
            const { uid } = tokenDecoded;
            this.firebaseApp.auth().getUser(uid);
            const user: User = await this.findById(uid);
            return user;
        } catch (error) {
            throw new UnauthorizedException(error);
        }
    }

    private async findById(id: string): Promise<User> {
        if (!id) {
            throw new Error("Invalid id");
        }
        const user: User = await this.usersRepository.findOne({
            select: {  
                id: true, 
                provider: true, 
                email: true,
            },
            where: { providerId: id },
        });
        if (!user) {
            throw new NotFoundException(`NotFoundException: User with id ${id} not found`);
        }
        return user;
    }
}
