import 'dart:async';

import 'package:collection/collection.dart';

import '/backend/schema/util/firestore_util.dart';
import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class DriverRecord extends FirestoreRecord {
  DriverRecord._(
    DocumentReference reference,
    Map<String, dynamic> data,
  ) : super(reference, data) {
    _initializeFields();
  }

  // "ID" field.
  String? _id;
  String get id => _id ?? '';
  bool hasId() => _id != null;

  // "address" field.
  String? _address;
  String get address => _address ?? '';
  bool hasAddress() => _address != null;

  // "car_number" field.
  String? _carNumber;
  String get carNumber => _carNumber ?? '';
  bool hasCarNumber() => _carNumber != null;

  // "email" field.
  String? _email;
  String get email => _email ?? '';
  bool hasEmail() => _email != null;

  // "index" field.
  String? _index;
  String get index => _index ?? '';
  bool hasIndex() => _index != null;

  // "name_surname" field.
  String? _nameSurname;
  String get nameSurname => _nameSurname ?? '';
  bool hasNameSurname() => _nameSurname != null;

  // "phone" field.
  String? _phone;
  String get phone => _phone ?? '';
  bool hasPhone() => _phone != null;

  DocumentReference get parentReference => reference.parent.parent!;

  void _initializeFields() {
    _id = snapshotData['ID'] as String?;
    _address = snapshotData['address'] as String?;
    _carNumber = snapshotData['car_number'] as String?;
    _email = snapshotData['email'] as String?;
    _index = snapshotData['index'] as String?;
    _nameSurname = snapshotData['name_surname'] as String?;
    _phone = snapshotData['phone'] as String?;
  }

  static Query<Map<String, dynamic>> collection([DocumentReference? parent]) =>
      parent != null
          ? parent.collection('driver')
          : FirebaseFirestore.instance.collectionGroup('driver');

  static DocumentReference createDoc(DocumentReference parent, {String? id}) =>
      parent.collection('driver').doc(id);

  static Stream<DriverRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => DriverRecord.fromSnapshot(s));

  static Future<DriverRecord> getDocumentOnce(DocumentReference ref) =>
      ref.get().then((s) => DriverRecord.fromSnapshot(s));

  static DriverRecord fromSnapshot(DocumentSnapshot snapshot) => DriverRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static DriverRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      DriverRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'DriverRecord(reference: ${reference.path}, data: $snapshotData)';

  @override
  int get hashCode => reference.path.hashCode;

  @override
  bool operator ==(other) =>
      other is DriverRecord &&
      reference.path.hashCode == other.reference.path.hashCode;
}

Map<String, dynamic> createDriverRecordData({
  String? id,
  String? address,
  String? carNumber,
  String? email,
  String? index,
  String? nameSurname,
  String? phone,
}) {
  final firestoreData = mapToFirestore(
    <String, dynamic>{
      'ID': id,
      'address': address,
      'car_number': carNumber,
      'email': email,
      'index': index,
      'name_surname': nameSurname,
      'phone': phone,
    }.withoutNulls,
  );

  return firestoreData;
}

class DriverRecordDocumentEquality implements Equality<DriverRecord> {
  const DriverRecordDocumentEquality();

  @override
  bool equals(DriverRecord? e1, DriverRecord? e2) {
    return e1?.id == e2?.id &&
        e1?.address == e2?.address &&
        e1?.carNumber == e2?.carNumber &&
        e1?.email == e2?.email &&
        e1?.index == e2?.index &&
        e1?.nameSurname == e2?.nameSurname &&
        e1?.phone == e2?.phone;
  }

  @override
  int hash(DriverRecord? e) => const ListEquality().hash([
        e?.id,
        e?.address,
        e?.carNumber,
        e?.email,
        e?.index,
        e?.nameSurname,
        e?.phone
      ]);

  @override
  bool isValidKey(Object? o) => o is DriverRecord;
}
