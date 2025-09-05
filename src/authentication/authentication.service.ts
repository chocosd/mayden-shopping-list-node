import { randomBytes } from "crypto";
import pkg, { sign } from "jsonwebtoken";
import { ShoppingCartModel } from "../routes/shopping-cart/shopping-cart.model";
import { type TokenConfig } from "../shared/interfaces/token-config.interface";
import UsersDto from "./users.dto";
import { type User } from "./users.interface";
import { UserModel } from "./users.model";

export class AuthenticationService {
  public expiresIn: string = "30d";
  public user = UserModel;

  public createToken(user: User): TokenConfig {
    return {
      token: sign(
        { userId: user._id },
        process.env.JWT_SECRET as string,
        { expiresIn: this.expiresIn } as pkg.SignOptions
      ),
      expiresIn: this.expiresIn,
    };
  }

  public createCookie(tokenData: TokenConfig): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
  }

  public createUser = async (dto: UsersDto): Promise<User> => {
    const user = await this.user.create({
      email: dto.email,
      password: dto.password,
      userId: randomId(12),
    });

    await ShoppingCartModel.create({ userId: user.userId });
    return user;
  };

  public findUserByEmail = async (email: string): Promise<User | null> => {
    const user = await this.user.findOne({ email });
    return user;
  };
}

function randomId(length = 12): string {
  return randomBytes(length)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .substring(0, length);
}
