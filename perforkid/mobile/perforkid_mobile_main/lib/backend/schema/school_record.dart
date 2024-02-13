 import 'dart:async';

import 'package:collection/collection.dart';

import '/backend/schema/util/firestore_util.dart';
import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class SchoolRecord extends FirestoreRecord {
  SchoolRecord._(
    DocumentReference reference,
    Map<String, dynamic> data,
  ) : super(reference, data) {
    _initializeFields();
  }

  // "school_driver_update" field.
  DateTime? _schoolDriverUpdate;
  DateTime? get schoolDriverUpdate => _schoolDriverUpdate;
  bool hasSchoolDriverUpdate() => _schoolDriverUpdate != null;

  // "school_banner" field.
  String? _schoolBanner;
  String get schoolBanner => _schoolBanner ?? '';
  bool hasSchoolBanner() => _schoolBanner != null;

  // "school_description_en" field.
  String? _schoolDescriptionEn;
  String get schoolDescriptionEn => _schoolDescriptionEn ?? '';
  bool hasSchoolDescriptionEn() => _schoolDescriptionEn != null;

  // "school_descriptioon_th" field.
  String? _schoolDescriptionTh;
  String get schoolDescriptionTh => _schoolDescriptionTh ?? '';
  bool hasschoolDescriptionTh() => _schoolDescriptionTh != null;

  // "school_image" field.
  String? _schoolImage;
  String get schoolImage => _schoolImage ?? '';
  bool hasSchoolImage() => _schoolImage != null;

  // "school_name" field.
  String? _schoolName;
  String get schoolName => _schoolName ?? '';
  bool hasSchoolName() => _schoolName != null;

  // "school_title_en" field.
  String? _schoolTitleEn;
  String get schoolTitleEn => _schoolTitleEn ?? '';
  bool hasSchoolTitleEn() => _schoolTitleEn != null;

  // "school_title_th" field.
  String? _schoolTitleTh;
  String get schoolTitleTh => _schoolTitleTh ?? '';
  bool hasSchoolTitleTh() => _schoolTitleTh != null;

  // "school_website" field.
  String? _schoolWebsite;
  String get schoolWebsite => _schoolWebsite ?? '';
  bool hasSchoolWebsite() => _schoolWebsite != null;

  void _initializeFields() {
    _schoolDriverUpdate = snapshotData['school-driver-update'] as DateTime?;
    _schoolBanner = snapshotData['school-banner'] as String?;
    _schoolDescriptionEn = snapshotData['school-description-en'] as String?;
    _schoolDescriptionTh = snapshotData['school-description-th'] as String?;
    _schoolImage = snapshotData['school-image'] as String?;
    _schoolName = snapshotData['school-name'] as String?;
    _schoolTitleEn = snapshotData['school-title-en'] as String?;
    _schoolTitleTh = snapshotData['school-title-th'] as String?;
    _schoolWebsite = snapshotData['school-website'] as String?;
  }

  static CollectionReference get collection =>
      FirebaseFirestore.instance.collection('school');

  static Stream<SchoolRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => SchoolRecord.fromSnapshot(s));

  static Future<SchoolRecord> getDocumentOnce(DocumentReference ref) =>
      ref.get().then((s) => SchoolRecord.fromSnapshot(s));

  static SchoolRecord fromSnapshot(DocumentSnapshot snapshot) => SchoolRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static SchoolRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      SchoolRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'SchoolRecord(reference: ${reference.path}, data: $snapshotData)';

  @override
  int get hashCode => reference.path.hashCode;

  @override
  bool operator ==(other) =>
      other is SchoolRecord &&
      reference.path.hashCode == other.reference.path.hashCode;
}

Map<String, dynamic> createSchoolRecordData({
  DateTime? schoolDriverUpdate,
  String? schoolBanner,
  String? schoolDescriptionEn,
  String? schoolDescriptionTh,
  String? schoolImage,
  String? schoolName,
  String? schoolTitleEn,
  String? schoolTitleTh,
  String? schoolWebsite,
}) {
  final firestoreData = mapToFirestore(
    <String, dynamic>{
      'school_driver_update': schoolDriverUpdate,
      'school_banner': schoolBanner,
      'school_description_en': schoolDescriptionEn,
      'school_descriptioon_th': schoolDescriptionTh,
      'school_image': schoolImage,
      'school_name': schoolName,
      'school_title_en': schoolTitleEn,
      'school_title_th': schoolTitleTh,
      'school_website': schoolWebsite,
    }.withoutNulls,
  );

  return firestoreData;
}

class SchoolRecordDocumentEquality implements Equality<SchoolRecord> {
  const SchoolRecordDocumentEquality();

  @override
  bool equals(SchoolRecord? e1, SchoolRecord? e2) {
    return e1?.schoolDriverUpdate == e2?.schoolDriverUpdate &&
        e1?.schoolBanner == e2?.schoolBanner &&
        e1?.schoolDescriptionEn == e2?.schoolDescriptionEn &&
        e1?.schoolDescriptionTh == e2?.schoolDescriptionTh &&
        e1?.schoolImage == e2?.schoolImage &&
        e1?.schoolName == e2?.schoolName &&
        e1?.schoolTitleEn == e2?.schoolTitleEn &&
        e1?.schoolTitleTh == e2?.schoolTitleTh &&
        e1?.schoolWebsite == e2?.schoolWebsite;
  }

  @override
  int hash(SchoolRecord? e) => const ListEquality().hash([
        e?.schoolDriverUpdate,
        e?.schoolBanner,
        e?.schoolDescriptionEn,
        e?.schoolDescriptionTh,
        e?.schoolImage,
        e?.schoolName,
        e?.schoolTitleEn,
        e?.schoolTitleTh,
        e?.schoolWebsite
      ]);

  @override
  bool isValidKey(Object? o) => o is SchoolRecord;
}
