import {
  ChannelTypeEnum,
  ISendMessageSuccessResponse,
  ISmsOptions,
  ISmsProvider,
  SmsEventStatusEnum,
  ISMSEventBody,
} from '@novu/stateless';

import { AnyObject } from '../types/sms';

if (!globalThis.fetch) {
  // eslint-disable-next-line global-require
  globalThis.fetch = require('node-fetch');
}

export class SmsMasivosSmsProvider implements ISmsProvider {
  public static readonly BASE_URL =
    'http://servicio.smsmasivos.com.ar/enviar_sms.asp';

  channelType = ChannelTypeEnum.SMS as ChannelTypeEnum.SMS;
  id = 'smsMasivos';

  private sms = {
    apiKey: '',
    user: '',
    password: '',
  };

  constructor(
    private config: {
      apiKey: string;
      user: string;
      password: string;
    }
  ) {
    this.sms.apiKey = config.apiKey;
    this.sms.user = config.user;
    this.sms.password = config.password;
  }

  async sendMessage(
    options: ISmsOptions
  ): Promise<ISendMessageSuccessResponse> {
    const params = {
      api: this.sms.apiKey,
      usuario: this.sms.user,
      clave: this.sms.password,
      tos: options.to,
      texto: options.content,
    };

    const urlSearchParams = new URLSearchParams(params);
    const url = new URL(SmsMasivosSmsProvider.BASE_URL);
    url.search = urlSearchParams.toString();

    const response = await fetch(url.toString());
    const body = await response.text();

    return { id: '1' };
  }
}
