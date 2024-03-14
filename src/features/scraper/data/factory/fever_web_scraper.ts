import { WebScraperInterface } from '../../domain/factory/web_scraper_interface';
import { EventEntity } from '../../domain/entities/event_entity';
import { FeverEventModel } from '../models/fever_event_model';

export class FeverWebScraper implements WebScraperInterface {

    private _eventsUrl = 'https://data-search.apigw.feverup.com/plan';

    eventDetailsUrl(id: string): string {
        return `https://beam.feverup.com/api/4.1/plans/${id}`;
    }

    async getEventsIds(page: number, cityCode: string): Promise<string[]> {

    const response = await fetch(
        this._eventsUrl,
        {
        method: 'POST',
        headers: {
            "accept": "application/json, text/plain, */*",
            "accept-language": "fr",
            "content-type": "application/json",
            "Referer": "https://feverup.com/",
            },
        body: `{\"query\":\"\",\"locale\":\"fr\",\"city_code\":\"${cityCode}\",\"page\":${page},\"page_size\":40}`
        }
    );
    const json = await response.json();

    return (json.results as any[] | undefined ?? [])
        .map<string>((e) => e.id.toString());
    }

    async getEvent(id: string): Promise<EventEntity> {
        const response = await fetch(
            this.eventDetailsUrl(id),
            {
                headers: {
                    "Accept-Language": "fr-FR"
                }
            }
        );

        const json = await response.json();

        return FeverEventModel.fromJson(json);
    }

    async getEvents(ids: string[]): Promise<EventEntity[]> {
        const result: EventEntity[] = [];
        for (const id of ids) {
            result.push(await this.getEvent(id));
        }
        return result;
    }

    async getCityEvents(cityCode: string): Promise<EventEntity[]> {

        let page = 1;
        let result: EventEntity[] = [];

        while (true) {
            const ids = await this.getEventsIds(page, cityCode);
            const res = await this.getEvents(ids);
            result = result.concat(res);
            ids.length = 0;
            if (res.length === 0) return result;
            res.length = 0;
            page++;
        }

    }

    async scrape(): Promise<EventEntity[]> {
        let result: EventEntity[] = [];
        const cities = [
            'LIG',
            'DGU',
            'PGF',
            'NCE',
            'MRS',
            'CFE',
            'LEH',
            'ORE',
            'RNS',
            'URO',
            'TUF',
            'CMR',
            'BES',
            'LME',
            'ANE',
            'MLH',
            'DIJ',
            'BIQ',
            'EBU',
            'XLE',
            'GNB',
            'ETZ',
            'ENC',
            'XVS',
            'LIL',
            'BOD',
            'TLS',
            'NCY',
            'LYS',
            'AJA',
            'FNI',
            'QXB',
            'TLN',
            'AVN',
            'XNA',
            'LRH',
            'SXB',
            'MPL',
            'PAR',
            'NTE',
        ];
        for (const cityCode of cities) {
            const cityEvents = await this.getCityEvents(cityCode);
            result = result.concat(cityEvents);
        }
        return result;
    }

}