-- Add screen-time reward type to shop items
alter table shop_items
  add column if not exists item_type text not null default 'general' check (item_type in ('general', 'screen_time')),
  add column if not exists screen_time_minutes int;

-- Add specific weekday scheduling to chore sets (1=Mon, 7=Sun)
alter table chore_sets
  add column if not exists weekdays int[] default null;

-- Add age-appropriate UI mode for kids (simple for 4-7, standard for 8+)
alter table kids
  add column if not exists ui_mode text not null default 'standard' check (ui_mode in ('simple', 'standard'));

comment on column shop_items.item_type is 'general | screen_time; screen_time items grant screen time as reward';
comment on column shop_items.screen_time_minutes is 'Minutes of screen time for screen_time items';
comment on column chore_sets.weekdays is 'For daily sets: only due on these weekdays (1=Mon .. 7=Sun). Null = every day';
comment on column kids.ui_mode is 'simple: minimal UI for ages 4-7; standard: full UI for 8+';
