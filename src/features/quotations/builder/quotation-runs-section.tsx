import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  BusbarRun,
  ItemKind,
  QuotationItem,
  QuotationRevision,
} from '@/api/quotations/quotations.types';
import type { QuotationSchedule } from '@/api/quotation-schedule/quotation-schedule.types';
import { MoneyText } from '@/components/common/money-text';
import { StatusChip } from '@/components/common/status-chip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PERMISSIONS } from '@/constants/permissions';
import { strings } from '@/constants/strings';
import { usePermission } from '@/hooks/use-permission';
import {
  asciiNumericFieldProps,
  parseQuantityInput,
  QUANTITY_SCALE,
  sanitizeAsciiNumericInput,
} from '@/lib/quotation-decimals';
import { cn } from '@/lib/cn';
import { Factory, Trash2 } from 'lucide-react';

interface QuotationRunsSectionProps {
  revision: QuotationRevision;
  schedule: QuotationSchedule | undefined;
  readOnly: boolean;
  expectedVersion: number;
  onAddRun: () => void;
  onUpdateRun: (runId: string, body: Record<string, unknown>) => void;
  onDeleteRun: (runId: string) => void;
  onCompleteRun: (runId: string) => void;
  onReopenRun: (runId: string) => void;
  onApplyStd: (runId: string, itemId?: string, itemKey?: string) => void;
  onApplyPerAmp: (runId: string) => void;
  onAddItem: (runId: string, kind: ItemKind, defaults: Record<string, unknown>) => void;
  onUpdateItem: (runId: string, itemId: string, body: Record<string, unknown>) => void;
  onDeleteItem: (runId: string, itemId: string) => void;
}

export function QuotationRunsSection({
  revision,
  schedule,
  readOnly,
  onAddRun,
  onUpdateRun,
  onDeleteRun,
  onCompleteRun,
  onReopenRun,
  onApplyStd,
  onApplyPerAmp,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}: QuotationRunsSectionProps) {
  const canViewCost = usePermission(PERMISSIONS.quotations.viewCost);

  return (
    <div className="space-y-4">
      {revision.runs.map((run, index) => (
        <RunCard
          key={run.id}
          run={run}
          runIndex={index}
          runCount={revision.runs.length}
          schedule={schedule}
          readOnly={readOnly}
          canViewCost={canViewCost}
          currencyCode={revision.currencyCode}
          onUpdateRun={(body) => onUpdateRun(run.id, body)}
          onDeleteRun={() => onDeleteRun(run.id)}
          onCompleteRun={() => onCompleteRun(run.id)}
          onReopenRun={() => onReopenRun(run.id)}
          onApplyStd={(itemId, itemKey) => onApplyStd(run.id, itemId, itemKey)}
          onApplyPerAmp={() => onApplyPerAmp(run.id)}
          onAddItem={(kind, defaults) => onAddItem(run.id, kind, defaults)}
          onUpdateItem={(itemId, body) => onUpdateItem(run.id, itemId, body)}
          onDeleteItem={(itemId) => onDeleteItem(run.id, itemId)}
        />
      ))}
      {!readOnly && (
        <Button variant="outline" className="w-full border-dashed py-6" onClick={onAddRun}>
          {strings.quotations.addRun}
        </Button>
      )}
    </div>
  );
}

function RunCard(props: {
  run: BusbarRun;
  runIndex: number;
  runCount: number;
  schedule: QuotationSchedule | undefined;
  readOnly: boolean;
  canViewCost: boolean;
  currencyCode: string;
  onUpdateRun: (body: Record<string, unknown>) => void;
  onDeleteRun: () => void;
  onCompleteRun: () => void;
  onReopenRun: () => void;
  onApplyStd: (itemId?: string, itemKey?: string) => void;
  onApplyPerAmp: () => void;
  onAddItem: (kind: ItemKind, defaults: Record<string, unknown>) => void;
  onUpdateItem: (itemId: string, body: Record<string, unknown>) => void;
  onDeleteItem: (itemId: string) => void;
}) {
  const {
    run,
    runCount,
    schedule,
    readOnly,
    canViewCost,
    currencyCode,
    onUpdateRun,
    onDeleteRun,
    onCompleteRun,
    onReopenRun,
    onApplyStd,
    onApplyPerAmp,
    onAddItem,
    onUpdateItem,
    onDeleteItem,
  } = props;

  const list = (key: keyof QuotationSchedule['lists']) =>
    schedule?.lists[key]?.map((x) => x.value) ?? [];

  const straight = run.straightElement;
  const canDeleteRun = !readOnly && runCount > 1 && !run.complete;
  const tapRatingOptions = list('tapRatings');

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Factory className="size-4 text-primary" aria-hidden />
          <span className="text-xs font-bold tracking-wide">{strings.quotations.busbarRun}</span>
          {run.complete ? (
            <StatusChip kind="quotationStatus" value="Issued" />
          ) : (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-100">
              {strings.quotations.runDraft}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!readOnly && (
            <Input
              className="max-w-[140px] font-medium"
              defaultValue={run.name}
              onBlur={(e) => onUpdateRun({ name: e.target.value.trim() })}
            />
          )}
          {readOnly && <span className="font-medium">{run.name}</span>}
          {canDeleteRun && (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="shrink-0 bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
              onClick={onDeleteRun}
            >
              <Trash2 className="size-4" aria-hidden />
              {strings.quotations.deleteRun}
            </Button>
          )}
        </div>
      </div>
      <div className="grid gap-3 border-b p-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        <SpecSelect
          label="Ampere"
          value={String(run.amp)}
          options={list('amperes')}
          disabled={readOnly || run.complete}
          onChange={(amp) => onUpdateRun({ amp: Number(amp) })}
        />
        <SpecSelect
          label="Conductor"
          value={run.conductor}
          options={list('conductors')}
          disabled={readOnly || run.complete}
          onChange={(conductor) => onUpdateRun({ conductor })}
        />
        <SpecSelect
          label="Poles"
          value={run.poles}
          options={list('poles')}
          disabled={readOnly || run.complete}
          onChange={(poles) => onUpdateRun({ poles })}
        />
        <SpecSelect
          label="IP"
          value={run.ip}
          options={list('ip')}
          disabled={readOnly || run.complete}
          onChange={(ip) => onUpdateRun({ ip })}
        />
        <SpecSelect
          label="Treatment"
          value={run.treatment}
          options={list('treatments')}
          disabled={readOnly || run.complete}
          onChange={(treatment) => onUpdateRun({ treatment })}
        />
        <SpecSelect
          label="Basis"
          value={run.basis}
          options={['Detailed Pricing', 'All-Inclusive LM']}
          disabled={readOnly || run.complete}
          onChange={(basis) => onUpdateRun({ basis })}
        />
        <div className="space-y-1">
          <Label className="text-xs">Pricing profile</Label>
          <Input
            defaultValue={run.pricingProfile}
            disabled={readOnly || run.complete}
            onBlur={(e) => onUpdateRun({ pricingProfile: e.target.value })}
          />
        </div>
      </div>
      {!readOnly && !run.complete && (
        <div className="flex flex-wrap gap-2 border-b px-4 py-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onApplyStd(straight.id, straight.itemKey)}
          >
            {strings.quotations.applyStd}
          </Button>
          <Button size="sm" variant="outline" onClick={onApplyPerAmp}>
            {strings.quotations.applyPerAmp}
          </Button>
          <Button size="sm" variant="outline" onClick={() => onAddItem('accessory', { quantity: '1.0000' })}>
            {strings.quotations.addAccessory}
          </Button>
          <Button size="sm" variant="outline" onClick={() => onAddItem('tap_off', { quantity: '1.0000' })}>
            {strings.quotations.addTapOff}
          </Button>
          <Button size="sm" variant="outline" onClick={() => onAddItem('end_feed', { quantity: '1.0000' })}>
            {strings.quotations.addEndFeed}
          </Button>
          <Button size="sm" variant="outline" onClick={() => onAddItem('custom', { quantity: '1.0000', description: 'Custom item' })}>
            {strings.quotations.addCustom}
          </Button>
          <Button size="sm" onClick={onCompleteRun}>
            {strings.quotations.completeRun}
          </Button>
        </div>
      )}
      {!readOnly && run.complete && (
        <div className="border-b px-4 py-2">
          <Button size="sm" variant="outline" onClick={onReopenRun}>
            {strings.quotations.reopenRun}
          </Button>
        </div>
      )}
      <div className="overflow-x-auto p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>{strings.quotations.description}</TableHead>
              <TableHead>{strings.quotations.unit}</TableHead>
              <TableHead className="text-end">{strings.quotations.qty}</TableHead>
              <TableHead className="text-end">{strings.quotations.unitPrice}</TableHead>
              <TableHead className="text-end">{strings.quotations.totalPrice}</TableHead>
              {canViewCost && (
                <>
                  <TableHead className="text-end">{strings.quotations.unitCost}</TableHead>
                  <TableHead className="text-end">{strings.quotations.totalCost}</TableHead>
                </>
              )}
              {!readOnly && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            <LineRow
              index={1}
              description={straight.description}
              unit={straight.unitCode}
              quantity={straight.quantity}
              unitSell={straight.unitSellAmountMinor}
              sellTotal={straight.sellAmountMinor}
              unitCost={straight.unitCostAmountMinor}
              costTotal={straight.costAmountMinor}
              costPending={straight.costPending}
              currencyCode={currencyCode}
              canViewCost={canViewCost}
              readOnly={readOnly || run.complete}
              straight
              onQuantityBlur={(q) => onUpdateRun({ straightQuantity: q })}
              onPriceBlur={() => undefined}
            />
            {run.items.map((item, ii) => (
              <ItemRows
                key={item.id}
                item={item}
                index={ii + 2}
                currencyCode={currencyCode}
                canViewCost={canViewCost}
                readOnly={readOnly || run.complete}
                tapRatingOptions={tapRatingOptions}
                onUpdateItem={onUpdateItem}
                onDeleteItem={onDeleteItem}
                onApplyStd={onApplyStd}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ItemRows({
  item,
  index,
  currencyCode,
  canViewCost,
  readOnly,
  tapRatingOptions,
  onUpdateItem,
  onDeleteItem,
  onApplyStd,
}: {
  item: QuotationItem;
  index: number;
  currencyCode: string;
  canViewCost: boolean;
  readOnly: boolean;
  tapRatingOptions: string[];
  onUpdateItem: (itemId: string, body: Record<string, unknown>) => void;
  onDeleteItem: (itemId: string) => void;
  onApplyStd: (itemId?: string, itemKey?: string) => void;
}) {
  const showApplyStd = !readOnly && item.kind === 'accessory' && item.itemKey;
  return (
    <>
      <LineRow
        index={index}
        description={item.description}
        unit={item.unitCode}
        quantity={item.quantity}
        unitSell={item.unitSellAmountMinor}
        sellTotal={item.sellAmountMinor}
        unitCost={item.unitCostAmountMinor}
        costTotal={item.costAmountMinor}
        costPending={item.costPending}
        currencyCode={currencyCode}
        canViewCost={canViewCost}
        readOnly={readOnly}
        extraActions={
          showApplyStd ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onApplyStd(item.id, item.itemKey)}
            >
              {strings.quotations.applyStdLine}
            </Button>
          ) : undefined
        }
        onQuantityBlur={(q) => onUpdateItem(item.id, { quantity: q })}
        onDescriptionBlur={(d) => onUpdateItem(item.id, { description: d })}
        onUnitSellBlur={(p) => onUpdateItem(item.id, { unitSellAmountMinor: p })}
        onUnitCostBlur={(p) => onUpdateItem(item.id, { unitCostAmountMinor: p })}
        onDelete={() => onDeleteItem(item.id)}
      />
      {item.kind === 'tap_off' && !readOnly && (
        <TableRow>
          <TableCell />
          <TableCell colSpan={canViewCost ? 8 : 6}>
            <div className="grid gap-2 sm:grid-cols-3">
              <SpecSelect
                label={strings.quotations.tapRating}
                value={item.tapRating ?? ''}
                options={tapRatingOptions}
                disabled={readOnly}
                onChange={(tapRating) => onUpdateItem(item.id, { tapRating })}
              />
              <div className="space-y-1">
                <Label className="text-xs">{strings.quotations.mccb}</Label>
                <Input
                  defaultValue={item.mccb ?? ''}
                  onBlur={(e) => onUpdateItem(item.id, { mccb: e.target.value || null })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{strings.quotations.polesLabel}</Label>
                <Input
                  defaultValue={item.poles ?? ''}
                  onBlur={(e) => onUpdateItem(item.id, { poles: e.target.value || null })}
                />
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function SpecSelect({
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  disabled?: boolean;
  onChange: (v: string) => void;
}) {
  if (options.length === 0) {
    return (
      <div className="space-y-1">
        <Label className="text-xs">{label}</Label>
        <Input defaultValue={value} disabled={disabled} onBlur={(e) => onChange(e.target.value)} />
      </div>
    );
  }
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Select value={value} disabled={disabled} onValueChange={onChange}>
        <SelectTrigger className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function LineRow(props: {
  index: number;
  description: string;
  unit: string;
  quantity: string;
  unitSell: number;
  sellTotal: number;
  unitCost?: number;
  costTotal?: number;
  costPending?: boolean;
  currencyCode: string;
  canViewCost: boolean;
  readOnly: boolean;
  straight?: boolean;
  onQuantityBlur: (q: string) => void;
  onDescriptionBlur?: (d: string) => void;
  onUnitSellBlur?: (minor: number) => void;
  onUnitCostBlur?: (minor: number) => void;
  onDelete?: () => void;
  onPriceBlur?: (p: number) => void;
  extraActions?: ReactNode;
}) {
  const [desc, setDesc] = useState(props.description);
  const [qtyText, setQtyText] = useState(props.quantity);
  const [qtyFocused, setQtyFocused] = useState(false);
  const [sellText, setSellText] = useState(() => (props.unitSell / 100).toFixed(2));
  const [sellFocused, setSellFocused] = useState(false);
  const [costText, setCostText] = useState(() => ((props.unitCost ?? 0) / 100).toFixed(2));
  const [costFocused, setCostFocused] = useState(false);
  const commitTimer = useRef<number | null>(null);
  const onQuantityBlurRef = useRef(props.onQuantityBlur);
  onQuantityBlurRef.current = props.onQuantityBlur;

  useEffect(() => {
    setDesc(props.description);
  }, [props.description]);

  // Keep the input in sync with the server value when we're not editing.
  useEffect(() => {
    if (!qtyFocused) setQtyText(props.quantity);
  }, [props.quantity, qtyFocused]);

  useEffect(() => {
    if (!sellFocused) setSellText((props.unitSell / 100).toFixed(2));
  }, [props.unitSell, sellFocused]);

  useEffect(() => {
    if (!costFocused) setCostText(((props.unitCost ?? 0) / 100).toFixed(2));
  }, [props.unitCost, costFocused]);

  const commitQty = useCallback(
    (raw: string, serverQuantity: string) => {
      const parsed = parseQuantityInput(raw);
      if (parsed !== serverQuantity) {
        onQuantityBlurRef.current(parsed);
      }
    },
    [],
  );

  // Autosave while typing (debounced) so totals refresh without blur.
  useEffect(() => {
    if (!qtyFocused || props.readOnly) return;
    if (qtyText === props.quantity) return;
    const n = Number(qtyText);
    if (qtyText.trim() === '' || !Number.isFinite(n) || n < 0) return;
    if (commitTimer.current) window.clearTimeout(commitTimer.current);
    commitTimer.current = window.setTimeout(() => {
      commitQty(qtyText, props.quantity);
    }, 700);
    return () => {
      if (commitTimer.current) window.clearTimeout(commitTimer.current);
    };
  }, [qtyText, qtyFocused, props.quantity, props.readOnly, commitQty]);

  useEffect(
    () => () => {
      if (commitTimer.current) window.clearTimeout(commitTimer.current);
    },
    [],
  );

  // Instant local preview of the line totals while typing.
  const qtyNum = Number(qtyFocused ? qtyText : props.quantity);
  const hasValidPreview = Number.isFinite(qtyNum) && qtyNum >= 0;
  const previewSellTotal = hasValidPreview ? Math.round(qtyNum * props.unitSell) : props.sellTotal;
  const previewCostTotal =
    props.costTotal !== undefined && props.unitCost !== undefined && hasValidPreview
      ? Math.round(qtyNum * props.unitCost)
      : props.costTotal;
  const showPreview = qtyFocused && hasValidPreview && qtyText !== props.quantity;
  const displaySellTotal = showPreview ? previewSellTotal : props.sellTotal;
  const displayCostTotal = showPreview ? previewCostTotal : props.costTotal;

  return (
    <TableRow className={cn(props.costPending && 'bg-amber-50/80 dark:bg-amber-950/20')}>
      <TableCell>{props.index}</TableCell>
      <TableCell>
        {props.readOnly || props.straight ? (
          <span>{props.description}</span>
        ) : (
          <Input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            onBlur={() => props.onDescriptionBlur?.(desc)}
          />
        )}
        {props.costPending && (
          <span className="mt-1 block text-xs text-amber-700 dark:text-amber-300">
            {strings.quotations.costPendingTitle}
          </span>
        )}
      </TableCell>
      <TableCell>{props.unit}</TableCell>
      <TableCell className="text-end">
        {props.readOnly ? (
          props.quantity
        ) : (
          <Input
            className="ms-auto max-w-24 text-end"
            value={qtyText}
            {...asciiNumericFieldProps(QUANTITY_SCALE)}
            onChange={(e) =>
              setQtyText(sanitizeAsciiNumericInput(e.target.value, QUANTITY_SCALE))
            }
            onFocus={() => setQtyFocused(true)}
            onBlur={() => {
              setQtyFocused(false);
              if (commitTimer.current) window.clearTimeout(commitTimer.current);
              commitQty(qtyText, props.quantity);
              // Re-format the visible value on blur.
              setQtyText(parseQuantityInput(qtyText));
            }}
          />
        )}
      </TableCell>
      <TableCell className="text-end">
        {props.readOnly ? (
          <MoneyText amountMinor={props.unitSell} currencyCode={props.currencyCode} />
        ) : (
          <Input
            className="ms-auto max-w-28 text-end"
            value={sellText}
            {...asciiNumericFieldProps(2)}
            onChange={(e) => setSellText(sanitizeAsciiNumericInput(e.target.value, 2))}
            onFocus={() => setSellFocused(true)}
            onBlur={() => {
              setSellFocused(false);
              const n = Number(sanitizeAsciiNumericInput(sellText, 2));
              if (Number.isFinite(n)) {
                props.onUnitSellBlur?.(Math.round(n * 100));
                setSellText(n.toFixed(2));
              }
            }}
          />
        )}
      </TableCell>
      <TableCell className="text-end font-medium">
        <MoneyText amountMinor={displaySellTotal} currencyCode={props.currencyCode} />
      </TableCell>
      {props.canViewCost && (
        <>
          <TableCell className="text-end">
            {props.unitCost !== undefined ? (
              props.readOnly ? (
                <MoneyText amountMinor={props.unitCost} currencyCode={props.currencyCode} />
              ) : (
                <Input
                  className="ms-auto max-w-28 text-end"
                  value={costText}
                  {...asciiNumericFieldProps(2)}
                  onChange={(e) => setCostText(sanitizeAsciiNumericInput(e.target.value, 2))}
                  onFocus={() => setCostFocused(true)}
                  onBlur={() => {
                    setCostFocused(false);
                    const n = Number(sanitizeAsciiNumericInput(costText, 2));
                    if (Number.isFinite(n)) {
                      props.onUnitCostBlur?.(Math.round(n * 100));
                      setCostText(n.toFixed(2));
                    }
                  }}
                />
              )
            ) : (
              strings.common.none
            )}
          </TableCell>
          <TableCell className="text-end">
            {displayCostTotal !== undefined ? (
              <MoneyText amountMinor={displayCostTotal} currencyCode={props.currencyCode} />
            ) : (
              strings.common.none
            )}
          </TableCell>
        </>
      )}
      {!props.readOnly && !props.straight && (
        <TableCell className="space-y-1">
          {props.extraActions}
          <Button size="sm" variant="ghost" onClick={props.onDelete}>
            {strings.common.delete}
          </Button>
        </TableCell>
      )}
      {!props.readOnly && props.straight && <TableCell />}
    </TableRow>
  );
}
