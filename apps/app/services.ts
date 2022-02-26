import {IncomingMessage} from 'http';
import {ApiService, PlaceholderService} from "@libraries/services";
import {Miniverse} from "react-miniverse";

class Services {

  private static instance?: Services;

  public readonly store: Miniverse;
  public readonly api: ApiService;
  public readonly placeholder: PlaceholderService;

  public constructor(_req?: IncomingMessage) {
    this.store = Miniverse.getInstance();
    this.api = new ApiService();
    this.placeholder = new PlaceholderService(this.api, this.store);
  }

  public static getInstance(req?: IncomingMessage): Services {
    if (!Services.instance) {
      Services.instance = new Services(req);
    }

    return Services.instance;
  }

  public close() {
    delete Services.instance
  }
}

export default Services;
