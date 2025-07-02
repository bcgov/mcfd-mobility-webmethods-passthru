enum RecordType {
  Case = 'case',
  Incident = 'incident',
  SR = 'sr',
  Memo = 'memo',
}

enum EntityType {
  Case = 'Case',
  Incident = 'Incident',
  SR = 'Service Request',
  Memo = 'Memo',
}

const EntityRecordMap = {
  [EntityType.Case]: RecordType.Case,
  [EntityType.Incident]: RecordType.Incident,
  [EntityType.SR]: RecordType.SR,
  [EntityType.Memo]: RecordType.Memo,
} as const;

enum RestrictedRecordEnum {
  True = 'Y',
  False = 'N',
}

enum EntityStatus {
  Open = 'Open',
  // We only want to show open cases
}

export {
  RecordType,
  EntityType,
  EntityRecordMap,
  RestrictedRecordEnum,
  EntityStatus,
};
