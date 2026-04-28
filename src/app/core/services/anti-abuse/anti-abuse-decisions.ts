import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import {
  AddAntiAbuseSanctionItemInput,
  AntiAbuseCaseDecision,
  AntiAbuseCaseDecisionInput,
  AntiAbuseSanctionDecision,
  AntiAbuseSanctionStatusInput,
  CharacterPointPenaltyDecision,
  CharacterPointPenaltyStatusInput,
  CreateAntiAbuseSanctionInput,
  CreateCharacterPointPenaltyInput,
  PlayerAbuseReportDecision,
  PlayerAbuseReportDecisionInput,
  PlayerRelationshipDeclarationDecision,
  PlayerRelationshipDeclarationDecisionInput,
  AntiAbuseSanctionItemDecision,
} from '../../domain/anti-abuse/anti-abuse-decision.model';
import { Row } from '../../types/supabase.types';
import {
  mapAntiAbuseCaseDecision,
  mapAntiAbuseSanctionDecision,
  mapAntiAbuseSanctionItemDecision,
  mapCharacterPointPenaltyDecision,
  mapPlayerAbuseReportDecision,
  mapPlayerRelationshipDeclarationDecision,
} from '../../utils/anti-abuse-decision-mappers';
import {
  toAddAntiAbuseSanctionItemRpcArgs,
  toCanManageAntiAbuseRpcArgs,
  toCreateAntiAbuseSanctionRpcArgs,
  toCreateCharacterPointPenaltyForSanctionRpcArgs,
  toSetAntiAbuseCaseDecisionRpcArgs,
  toSetAntiAbuseSanctionStatusRpcArgs,
  toSetCharacterPointPenaltyStatusRpcArgs,
  toSetPlayerAbuseReportDecisionRpcArgs,
  toSetPlayerRelationshipDeclarationDecisionRpcArgs,
} from '../../utils/anti-abuse-decision-rpc';
import { Backend } from '../backend/backend';

@Injectable({ providedIn: 'root' })
export class AntiAbuseDecisions {
  private readonly backend = inject(Backend);

  canManage(serverId: string): Observable<boolean> {
    return this.backend.rpc<boolean>(
      RPC.can_manage_anti_abuse,
      toCanManageAntiAbuseRpcArgs(serverId),
    );
  }

  setCaseDecision(
    input: AntiAbuseCaseDecisionInput,
  ): Observable<AntiAbuseCaseDecision> {
    return this.backend
      .rpc<Row<'anti_abuse_cases'>>(
        RPC.set_anti_abuse_case_decision,
        toSetAntiAbuseCaseDecisionRpcArgs(input),
      )
      .pipe(map(mapAntiAbuseCaseDecision));
  }

  setRelationshipDeclarationDecision(
    input: PlayerRelationshipDeclarationDecisionInput,
  ): Observable<PlayerRelationshipDeclarationDecision> {
    return this.backend
      .rpc<Row<'player_relationship_declarations'>>(
        RPC.set_player_relationship_declaration_decision,
        toSetPlayerRelationshipDeclarationDecisionRpcArgs(input),
      )
      .pipe(map(mapPlayerRelationshipDeclarationDecision));
  }

  setAbuseReportDecision(
    input: PlayerAbuseReportDecisionInput,
  ): Observable<PlayerAbuseReportDecision> {
    return this.backend
      .rpc<Row<'player_abuse_reports'>>(
        RPC.set_player_abuse_report_decision,
        toSetPlayerAbuseReportDecisionRpcArgs(input),
      )
      .pipe(map(mapPlayerAbuseReportDecision));
  }

  createSanction(
    input: CreateAntiAbuseSanctionInput,
  ): Observable<AntiAbuseSanctionDecision> {
    return this.backend
      .rpc<Row<'anti_abuse_sanctions'>>(
        RPC.create_anti_abuse_sanction,
        toCreateAntiAbuseSanctionRpcArgs(input),
      )
      .pipe(map(mapAntiAbuseSanctionDecision));
  }

  setSanctionStatus(
    input: AntiAbuseSanctionStatusInput,
  ): Observable<AntiAbuseSanctionDecision> {
    return this.backend
      .rpc<Row<'anti_abuse_sanctions'>>(
        RPC.set_anti_abuse_sanction_status,
        toSetAntiAbuseSanctionStatusRpcArgs(input),
      )
      .pipe(map(mapAntiAbuseSanctionDecision));
  }

  createCharacterPointPenalty(
    input: CreateCharacterPointPenaltyInput,
  ): Observable<CharacterPointPenaltyDecision> {
    return this.backend
      .rpc<Row<'character_point_penalties'>>(
        RPC.create_character_point_penalty_for_sanction,
        toCreateCharacterPointPenaltyForSanctionRpcArgs(input),
      )
      .pipe(map(mapCharacterPointPenaltyDecision));
  }

  setCharacterPointPenaltyStatus(
    input: CharacterPointPenaltyStatusInput,
  ): Observable<CharacterPointPenaltyDecision> {
    return this.backend
      .rpc<Row<'character_point_penalties'>>(
        RPC.set_character_point_penalty_status,
        toSetCharacterPointPenaltyStatusRpcArgs(input),
      )
      .pipe(map(mapCharacterPointPenaltyDecision));
  }

  addSanctionItem(
    input: AddAntiAbuseSanctionItemInput,
  ): Observable<AntiAbuseSanctionItemDecision> {
    return this.backend
      .rpc<Row<'anti_abuse_sanction_items'>>(
        RPC.add_anti_abuse_sanction_item,
        toAddAntiAbuseSanctionItemRpcArgs(input),
      )
      .pipe(map(mapAntiAbuseSanctionItemDecision));
  }
}
