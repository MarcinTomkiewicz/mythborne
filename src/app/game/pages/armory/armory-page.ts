import { Component, OnInit, computed, inject } from '@angular/core';
import { equipmentPreviewIconClassForSlot } from '../../../core/domain/equipment/equipment-preview-icons.config';
import { EquipmentPreviewSlotRow } from '../../../core/domain/equipment/equipment-preview.model';
import { PlayerArmoryEquipmentSlotReadModel } from '../../../core/domain/item/player-armory-page-context.model';
import { ArmoryPageFacade } from '../../../core/services/items/armory-page.facade';
import { EquipmentPreview } from '../../../shared/equipment-preview/equipment-preview';

@Component({
  selector: 'app-armory-page',
  standalone: true,
  imports: [EquipmentPreview],
  providers: [ArmoryPageFacade],
  templateUrl: './armory-page.html',
  host: { class: 'd-block w-100' },
})
export class ArmoryPage implements OnInit {
  readonly page = inject(ArmoryPageFacade);
  readonly equippedItemCount = computed(() =>
    this.page.equipmentSlots().filter((slot) => slot.hasItem).length,
  );
  readonly equipmentPreviewRows = computed(() =>
    mapArmoryPageEquipmentPreviewRows(this.page.equipmentSlots()),
  );
  readonly savedLoadoutCount = computed(() =>
    this.page.loadoutPresets().filter((preset) => preset.savedAt !== null).length,
  );

  ngOnInit(): void {
    this.page.loadData();
  }
}

function mapArmoryPageEquipmentPreviewRows(
  slots: readonly PlayerArmoryEquipmentSlotReadModel[],
): EquipmentPreviewSlotRow[] {
  return slots.map((slot) => ({
    slotKey: slot.slotKey,
    label: slot.slotLabel,
    sortOrder: slot.slotSortOrder,
    iconClass: equipmentPreviewIconClassForSlot(slot.slotKey),
    emptyDisplayName: slot.hasItem ? null : slot.itemDisplayName,
    emptyDisplayDetail: slot.hasItem ? null : slot.itemDisplayStateLabel,
    item: slot.hasItem
      ? {
          itemId: slot.itemId!,
          name: slot.itemDisplayName,
          metadata: slot.itemDisplayStateLabel,
          statusLabel: slot.itemDisplayStateLabel,
          qualityLabel: slot.qualityLabel,
          kindLabel: slot.baseName,
          slotLabel: slot.slotLabel,
        }
      : null,
  }));
}
