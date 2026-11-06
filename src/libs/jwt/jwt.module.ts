import { JwtModule } from '@nestjs/jwt';
import jwtConfig, { JwtConfig } from '@src/libs/configuration/jwt.config';
import { StringValue } from 'ms';

export const ConfiguredJwtModule = JwtModule.registerAsync({
  useFactory: (config: JwtConfig) => ({
    global: true,
    secret: config.secret,
    signOptions: { expiresIn: config.expiration as StringValue },
  }),
  inject: [jwtConfig.KEY],
});
