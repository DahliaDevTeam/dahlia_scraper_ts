import { EventOrganizer } from "../../../../core/business_objects/event_organizer";
import { Location } from "../../../../core/business_objects/location";
import { Price } from "../../../../core/business_objects/price";
import { utf8Encode } from "../../../../core/utils/utf8_encode";
import { ScrapedSite } from "../../domain/enums/scraped_sites_enum";
import { EventModel } from "./event_model";

export interface IFeverEventModel {
    
    readonly id: number;
    readonly name: string;
    readonly startDate: Date;
    readonly endDate: Date;
    readonly description: string;
    readonly image: string;
    readonly organizer: EventOrganizer;
    readonly price?: Price;
    readonly tags: string[];
    readonly location: Location;
    readonly url: string;
    readonly availableTickets: number;

}

export class FeverEventModel extends EventModel {

    constructor(event: IFeverEventModel) {
        super({
            ...event,
            source: ScrapedSite.eventbrite,
            isFree: false,
            isOnline: false,
        });
    }

    static fromJson(json: any): FeverEventModel {
        return new FeverEventModel({
            id: json.id,
            name: utf8Encode(json.name),
            startDate: new Date(Date.parse(json.default_session.starts_at_iso)),
            endDate: new Date(Date.parse(json.default_session.ends_at_iso)),
            description: json.description,
            image: json.cover_image,
            organizer: {
                uid: json.partner.id.toString(),
                name: json.partner.name,
                followers: 0,
                events: 0
            },
            price: {
                value: json.price_info.amount,
                currency: json.price_info.currency
            },
            tags: [
                json.category
            ],
            location: {
                name: utf8Encode(json.place.name),
                address: {
                    countryCode: json.place.city.country,
                    city: utf8Encode(json.place.city.name),
                    region: '',
                    street: utf8Encode((json.place.address as string).split(', ')[0]),
                    postalCode: utf8Encode((json.place.address as string).split(', ')[1])
                }
            },
            url: json.default_session.share_url,
            availableTickets: json.default_session.available_tickets
        });
    }
    
}