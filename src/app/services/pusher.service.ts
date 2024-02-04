/* eslint-disable @typescript-eslint/member-ordering */

import { Injectable } from '@angular/core';
import Pusher from 'pusher-js';
import { environment } from 'src/environments/environment';


@Injectable()
export class PusherService {
  constructor() {
  // Replace this with your pusher key
    this.pusher = new Pusher(environment.pusher.key, {
      cluster: environment.pusher.cluster
    });
  }
  pusher;

  public init(channel) {
    return this.pusher.subscribe(channel);
  }
}
