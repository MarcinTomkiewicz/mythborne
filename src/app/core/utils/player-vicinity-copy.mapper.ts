import {
  PlayerVicinityCopyReadModel,
} from '../domain/vicinity/player-vicinity-page-context.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  read,
  requiredRecord,
  requiredText,
} from './json-read';

export function mapPlayerVicinityCopyJson(
  value: Json | undefined,
): PlayerVicinityCopyReadModel {
  const copyJson = requiredRecord(value, 'copyJson');

  return {
    page: mapPage(requiredRecord(read(copyJson, 'page'), 'copyJson.page')),
    sections: mapSections(requiredRecord(read(copyJson, 'sections'), 'copyJson.sections')),
    toolbar: mapToolbar(requiredRecord(read(copyJson, 'toolbar'), 'copyJson.toolbar')),
    summary: mapSummary(requiredRecord(read(copyJson, 'summary'), 'copyJson.summary')),
    relocation: mapRelocation(requiredRecord(
      read(copyJson, 'relocation'),
      'copyJson.relocation',
    )),
    selectedTarget: mapSelectedTarget(requiredRecord(
      read(copyJson, 'selectedTarget'),
      'copyJson.selectedTarget',
    )),
    addressList: mapAddressList(requiredRecord(
      read(copyJson, 'addressList'),
      'copyJson.addressList',
    )),
    pagination: mapPagination(requiredRecord(
      read(copyJson, 'pagination'),
      'copyJson.pagination',
    )),
    errors: mapErrors(requiredRecord(read(copyJson, 'errors'), 'copyJson.errors')),
    filters: mapFilters(requiredRecord(read(copyJson, 'filters'), 'copyJson.filters')),
    labels: mapLabels(requiredRecord(read(copyJson, 'labels'), 'copyJson.labels')),
    empty: mapEmpty(requiredRecord(read(copyJson, 'empty'), 'copyJson.empty')),
    helper: mapHelper(requiredRecord(read(copyJson, 'helper'), 'copyJson.helper')),
  };
}

function mapPage(page: JsonRecord): PlayerVicinityCopyReadModel['page'] {
  return {
    errorLabel: requiredText(read(page, 'errorLabel'), 'copyJson.page.errorLabel'),
    pvpLabel: requiredText(read(page, 'pvpLabel'), 'copyJson.page.pvpLabel'),
    summaryAriaLabel: requiredText(
      read(page, 'summaryAriaLabel'),
      'copyJson.page.summaryAriaLabel',
    ),
  };
}

function mapSections(sections: JsonRecord): PlayerVicinityCopyReadModel['sections'] {
  return {
    vicinity: requiredText(read(sections, 'vicinity'), 'copyJson.sections.vicinity'),
    currentEstate: requiredText(
      read(sections, 'currentEstate'),
      'copyJson.sections.currentEstate',
    ),
    addresses: requiredText(read(sections, 'addresses'), 'copyJson.sections.addresses'),
    districts: requiredText(read(sections, 'districts'), 'copyJson.sections.districts'),
  };
}

function mapToolbar(toolbar: JsonRecord): PlayerVicinityCopyReadModel['toolbar'] {
  return {
    currentVicinityButtonLabel: requiredText(
      read(toolbar, 'currentVicinityButtonLabel'),
      'copyJson.toolbar.currentVicinityButtonLabel',
    ),
    searchLabel: requiredText(read(toolbar, 'searchLabel'), 'copyJson.toolbar.searchLabel'),
    searchPlaceholder: requiredText(
      read(toolbar, 'searchPlaceholder'),
      'copyJson.toolbar.searchPlaceholder',
    ),
    searchButtonLabel: requiredText(
      read(toolbar, 'searchButtonLabel'),
      'copyJson.toolbar.searchButtonLabel',
    ),
  };
}

function mapSummary(summary: JsonRecord): PlayerVicinityCopyReadModel['summary'] {
  return {
    backendDataUnavailableLabel: requiredText(
      read(summary, 'backendDataUnavailableLabel'),
      'copyJson.summary.backendDataUnavailableLabel',
    ),
    dailyAttacksLabel: requiredText(
      read(summary, 'dailyAttacksLabel'),
      'copyJson.summary.dailyAttacksLabel',
    ),
    currentAddressLabel: requiredText(
      read(summary, 'currentAddressLabel'),
      'copyJson.summary.currentAddressLabel',
    ),
    attackProtectionLabel: requiredText(
      read(summary, 'attackProtectionLabel'),
      'copyJson.summary.attackProtectionLabel',
    ),
    siegeProtectionLabel: requiredText(
      read(summary, 'siegeProtectionLabel'),
      'copyJson.summary.siegeProtectionLabel',
    ),
    noActiveProtectionLabel: requiredText(
      read(summary, 'noActiveProtectionLabel'),
      'copyJson.summary.noActiveProtectionLabel',
    ),
  };
}

function mapRelocation(relocation: JsonRecord): PlayerVicinityCopyReadModel['relocation'] {
  return {
    confirmTitle: requiredText(
      read(relocation, 'confirmTitle'),
      'copyJson.relocation.confirmTitle',
    ),
    confirmMessage: requiredText(
      read(relocation, 'confirmMessage'),
      'copyJson.relocation.confirmMessage',
    ),
    confirmLabel: requiredText(
      read(relocation, 'confirmLabel'),
      'copyJson.relocation.confirmLabel',
    ),
    cancelLabel: requiredText(
      read(relocation, 'cancelLabel'),
      'copyJson.relocation.cancelLabel',
    ),
    confirmMessageParts: mapRelocationConfirmMessageParts(requiredRecord(
      read(relocation, 'confirmMessageParts'),
      'copyJson.relocation.confirmMessageParts',
    )),
  };
}

function mapRelocationConfirmMessageParts(
  parts: JsonRecord,
): PlayerVicinityCopyReadModel['relocation']['confirmMessageParts'] {
  return {
    intro: requiredText(
      read(parts, 'intro'),
      'copyJson.relocation.confirmMessageParts.intro',
    ),
    warningLabel: requiredText(
      read(parts, 'warningLabel'),
      'copyJson.relocation.confirmMessageParts.warningLabel',
    ),
    warningText: requiredText(
      read(parts, 'warningText'),
      'copyJson.relocation.confirmMessageParts.warningText',
    ),
  };
}

function mapSelectedTarget(
  selectedTarget: JsonRecord,
): PlayerVicinityCopyReadModel['selectedTarget'] {
  return {
    targetLabel: requiredText(
      read(selectedTarget, 'targetLabel'),
      'copyJson.selectedTarget.targetLabel',
    ),
    attackTravelLabel: requiredText(
      read(selectedTarget, 'attackTravelLabel'),
      'copyJson.selectedTarget.attackTravelLabel',
    ),
    spyTravelLabel: requiredText(
      read(selectedTarget, 'spyTravelLabel'),
      'copyJson.selectedTarget.spyTravelLabel',
    ),
    siegeLabel: requiredText(
      read(selectedTarget, 'siegeLabel'),
      'copyJson.selectedTarget.siegeLabel',
    ),
    protectionLabel: requiredText(
      read(selectedTarget, 'protectionLabel'),
      'copyJson.selectedTarget.protectionLabel',
    ),
  };
}

function mapAddressList(addressList: JsonRecord): PlayerVicinityCopyReadModel['addressList'] {
  return {
    columnHero: requiredText(
      read(addressList, 'columnHero'),
      'copyJson.addressList.columnHero',
    ),
    columnLevel: requiredText(
      read(addressList, 'columnLevel'),
      'copyJson.addressList.columnLevel',
    ),
    columnAttack: requiredText(
      read(addressList, 'columnAttack'),
      'copyJson.addressList.columnAttack',
    ),
    columnSpy: requiredText(
      read(addressList, 'columnSpy'),
      'copyJson.addressList.columnSpy',
    ),
    columnActions: requiredText(
      read(addressList, 'columnActions'),
      'copyJson.addressList.columnActions',
    ),
    claimEstateLabel: requiredText(
      read(addressList, 'claimEstateLabel'),
      'copyJson.addressList.claimEstateLabel',
    ),
    noGuildLabel: requiredText(
      read(addressList, 'noGuildLabel'),
      'copyJson.addressList.noGuildLabel',
    ),
    sameGuildLabel: requiredText(
      read(addressList, 'sameGuildLabel'),
      'copyJson.addressList.sameGuildLabel',
    ),
    protectedTargetAriaLabel: requiredText(
      read(addressList, 'protectedTargetAriaLabel'),
      'copyJson.addressList.protectedTargetAriaLabel',
    ),
    metricUnavailableLabel: requiredText(
      read(addressList, 'metricUnavailableLabel'),
      'copyJson.addressList.metricUnavailableLabel',
    ),
    protectionUntilTemplate: requiredText(
      read(addressList, 'protectionUntilTemplate'),
      'copyJson.addressList.protectionUntilTemplate',
    ),
    attackTooltip: requiredText(
      read(addressList, 'attackTooltip'),
      'copyJson.addressList.attackTooltip',
    ),
    spyTooltip: requiredText(
      read(addressList, 'spyTooltip'),
      'copyJson.addressList.spyTooltip',
    ),
    siegeTooltip: requiredText(
      read(addressList, 'siegeTooltip'),
      'copyJson.addressList.siegeTooltip',
    ),
    claimEstateTooltip: requiredText(
      read(addressList, 'claimEstateTooltip'),
      'copyJson.addressList.claimEstateTooltip',
    ),
  };
}

function mapPagination(pagination: JsonRecord): PlayerVicinityCopyReadModel['pagination'] {
  return {
    pageLabelTemplate: requiredText(
      read(pagination, 'pageLabelTemplate'),
      'copyJson.pagination.pageLabelTemplate',
    ),
    pageSelectPlaceholder: requiredText(
      read(pagination, 'pageSelectPlaceholder'),
      'copyJson.pagination.pageSelectPlaceholder',
    ),
    rangeSummaryTemplate: requiredText(
      read(pagination, 'rangeSummaryTemplate'),
      'copyJson.pagination.rangeSummaryTemplate',
    ),
    pageUnavailableLabel: requiredText(
      read(pagination, 'pageUnavailableLabel'),
      'copyJson.pagination.pageUnavailableLabel',
    ),
    rangeUnavailableLabel: requiredText(
      read(pagination, 'rangeUnavailableLabel'),
      'copyJson.pagination.rangeUnavailableLabel',
    ),
  };
}

function mapErrors(errors: JsonRecord): PlayerVicinityCopyReadModel['errors'] {
  return {
    inactiveDistrictTemplate: requiredText(
      read(errors, 'inactiveDistrictTemplate'),
      'copyJson.errors.inactiveDistrictTemplate',
    ),
  };
}

function mapFilters(filters: JsonRecord): PlayerVicinityCopyReadModel['filters'] {
  return {
    district: requiredText(read(filters, 'district'), 'copyJson.filters.district'),
    allDistricts: requiredText(
      read(filters, 'allDistricts'),
      'copyJson.filters.allDistricts',
    ),
  };
}

function mapLabels(labels: JsonRecord): PlayerVicinityCopyReadModel['labels'] {
  return {
    address: requiredText(read(labels, 'address'), 'copyJson.labels.address'),
    district: requiredText(read(labels, 'district'), 'copyJson.labels.district'),
    occupied: requiredText(read(labels, 'occupied'), 'copyJson.labels.occupied'),
    empty: requiredText(read(labels, 'empty'), 'copyJson.labels.empty'),
    currentEstate: requiredText(
      read(labels, 'currentEstate'),
      'copyJson.labels.currentEstate',
    ),
    estateRank: requiredText(read(labels, 'estateRank'), 'copyJson.labels.estateRank'),
  };
}

function mapEmpty(empty: JsonRecord): PlayerVicinityCopyReadModel['empty'] {
  return {
    occupiedEstates: requiredText(
      read(empty, 'occupiedEstates'),
      'copyJson.empty.occupiedEstates',
    ),
    districtAddresses: requiredText(
      read(empty, 'districtAddresses'),
      'copyJson.empty.districtAddresses',
    ),
  };
}

function mapHelper(helper: JsonRecord): PlayerVicinityCopyReadModel['helper'] {
  return {
    emptyAddressGeneration: requiredText(
      read(helper, 'emptyAddressGeneration'),
      'copyJson.helper.emptyAddressGeneration',
    ),
  };
}
