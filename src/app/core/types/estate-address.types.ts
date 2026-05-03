import { Row } from './supabase.types';

export type EstateDistrictCapacityRow = Row<'estate_district_address_capacities'>;
export type EstateAddressDistrictRow = Row<'estate_districts'>;
export type OccupiedEstateAddressRow = Pick<
  Row<'estates'>,
  'id' | 'server_id' | 'district_code' | 'address_number'
>;
