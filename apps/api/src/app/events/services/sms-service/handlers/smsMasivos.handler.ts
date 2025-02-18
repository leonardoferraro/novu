import { ChannelTypeEnum } from '@novu/shared';
import { ICredentials } from '@novu/dal';
import { SmsMasivosSmsProvider } from '@novu/smsMasivos';
import { BaseSmsHandler } from './base.handler';

export class SmsMasivosHandler extends BaseSmsHandler {
  constructor() {
    super('smsMasivos', ChannelTypeEnum.SMS);
  }
  buildProvider(credentials: ICredentials) {
    const config: {
      apiKey: string;
      user: string;
      password: string;
      from?: string;
    } = {
      apiKey: credentials.apiKey,
      user: credentials.user,
      password: credentials.password,
      from: credentials.from,
    };

    this.provider = new SmsMasivosSmsProvider(config);
  }
}
