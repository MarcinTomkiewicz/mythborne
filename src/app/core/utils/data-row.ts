import type {
  AddressDataRow,
  DataRow,
  RankingDataRow,
} from '../types/data-row.types';

export function isAddressDataRow(row: DataRow): row is AddressDataRow {
  return typeof row.addressNumber === 'number';
}

export function isRankingDataRow(row: DataRow): row is RankingDataRow {
  return 'rankingRow' in row;
}
