
import axios from 'axios';

export interface State {
    state: string;
    districts: string[];
}

export interface LocationData {
    district: string;
    state: string;
    village: string;
    tehsil: string;
}

export interface TehsilVillageData {
    tehsils: string[];
    villages: string[];
    tehsilVillageMap: Record<string, string[]>;
}

export const fetchStatesAndDistricts = async (): Promise<State[]> => {
    try {
        const response = await axios.get('https://raw.githubusercontent.com/sab99r/Indian-States-And-Districts/master/states-and-districts.json');
        if (response.data && response.data.states) {
            return response.data.states;
        }
        return [];
    } catch (error) {
        console.error('Error fetching states and districts:', error);
        return [];
    }
};

export const fetchTehsilsAndVillages = async (district: string): Promise<TehsilVillageData> => {
    try {
        const response = await axios.get(`https://api.postalpincode.in/postoffice/${district}`);

        if (response.data && response.data[0] && response.data[0].Status === 'Success') {
            const postOffices = response.data[0].PostOffice;
            const tehsils = new Set<string>();
            const villages = new Set<string>();
            const tehsilVillageMap: Record<string, string[]> = {};

            postOffices.forEach((po: any) => {
                const tehsil = po.Block || po.Taluk || 'Unknown';
                const village = po.Name;

                tehsils.add(tehsil);
                villages.add(village);

                if (!tehsilVillageMap[tehsil]) {
                    tehsilVillageMap[tehsil] = [];
                }
                if (!tehsilVillageMap[tehsil].includes(village)) {
                    tehsilVillageMap[tehsil].push(village);
                }
            });

            return {
                tehsils: Array.from(tehsils).sort(),
                villages: Array.from(villages).sort(),
                tehsilVillageMap
            };
        }
        return { tehsils: [], villages: [], tehsilVillageMap: {} };
    } catch (error) {
        console.error('Error fetching tehsils and villages:', error);
        return { tehsils: [], villages: [], tehsilVillageMap: {} };
    }
};

export const fetchLocationByPincode = async (pincode: string): Promise<LocationData | null> => {
    try {
        if (pincode.length !== 6) return null;
        const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);

        if (response.data && response.data[0] && response.data[0].Status === 'Success') {
            const postOffice = response.data[0].PostOffice[0];
            return {
                district: postOffice.District,
                state: postOffice.State,
                village: postOffice.Name,
                tehsil: postOffice.Block,
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching location by pincode:', error);
        return null;
    }
};
