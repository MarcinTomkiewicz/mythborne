export const RPC = {
  has_global_role: 'has_global_role',
  create_config_change_set_draft: 'create_config_change_set_draft',
  create_config_value_change_entry: 'create_config_value_change_entry',
  mark_config_change_set_ready: 'mark_config_change_set_ready',
  apply_config_change_set: 'apply_config_change_set',
  cancel_config_change_set: 'cancel_config_change_set',
  write_audit_log: 'write_audit_log',
  can_manage_anti_abuse: 'can_manage_anti_abuse',
  set_anti_abuse_case_decision: 'set_anti_abuse_case_decision',
  set_player_relationship_declaration_decision:
    'set_player_relationship_declaration_decision',
  set_player_abuse_report_decision: 'set_player_abuse_report_decision',
  create_anti_abuse_sanction: 'create_anti_abuse_sanction',
  set_anti_abuse_sanction_status: 'set_anti_abuse_sanction_status',
  create_character_point_penalty_for_sanction:
    'create_character_point_penalty_for_sanction',
  set_character_point_penalty_status: 'set_character_point_penalty_status',
  add_anti_abuse_sanction_item: 'add_anti_abuse_sanction_item',
} as const;
