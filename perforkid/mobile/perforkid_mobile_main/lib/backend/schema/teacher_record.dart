import 'dart:async';

import 'package:collection/collection.dart';

import '/backend/schema/util/firestore_util.dart';
import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class TeacherRecord extends FirestoreRecord {
  TeacherRecord._(
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

  // "classroom" field.
  String? _classroom;
  String get classroom => _classroom ?? '';
  bool hasClassroom() => _classroom != null;

  // "email" field.
  String? _email;
  String get email => _email ?? '';
  bool hasEmail() => _email != null;

  // "index" field.
  String? _index;
  String get index => _index ?? '';
  bool hasIndex() => _index != null;

  // "phone" field.
  String? _phone;
  String get phone => _phone ?? '';
  bool hasPhone() => _phone != null;

  // "teaching_room" field.
  String? _teachingRoom;
  String get teachingRoom => _teachingRoom ?? '';
  bool hasTeachingRoom() => _teachingRoom != null;

  DocumentReference get parentReference => reference.parent.parent!;

  void _initializeFields() {
    _id = snapshotData['ID'] as String?;
    _address = snapshotData['address'] as String?;
    _classroom = snapshotData['classroom'] as String?;
    _email = snapshotData['email'] as String?;
    _index = snapshotData['index'] as String?;
    _phone = snapshotData['phone'] as String?;
    _teachingRoom = snapshotData['teaching_room'] as String?;
  }

  static Query<Map<String, dynamic>> collection([DocumentReference? parent]) =>
      parent != null
          ? parent.collection('teacher')
          : FirebaseFirestore.instance.collectionGroup('teacher');

  static DocumentReference createDoc(DocumentReference parent, {String? id}) =>
      parent.collection('teacher').doc(id);

  static Stream<TeacherRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => TeacherRecord.fromSnapshot(s));

  static Future<TeacherRecord> getDocumentOnce(DocumentReference ref) =>
      ref.get().then((s) => TeacherRecord.fromSnapshot(s));

  static TeacherRecord fromSnapshot(DocumentSnapshot snapshot) =>
      TeacherRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static TeacherRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      TeacherRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'TeacherRecord(reference: ${reference.path}, data: $snapshotData)';

  @override
  int get hashCode => reference.path.hashCode;

  @override
  bool operator ==(other) =>
      other is TeacherRecord &&
      reference.path.hashCode == other.reference.path.hashCode;
}

Map<String, dynamic> createTeacherRecordData({
  String? id,
  String? address,
  String? classroom,
  String? email,
  String? index,
  String? phone,
  String? teachingRoom,
}) {
  final firestoreData = mapToFirestore(
    <String, dynamic>{
      'ID': id,
      'address': address,
      'classroom': classroom,
      'email': email,
      'index': index,
      'phone': phone,
      'teaching_room': teachingRoom,
    }.withoutNulls,
  );

  return firestoreData;
}

class TeacherRecordDocumentEquality implements Equality<TeacherRecord> {
  const TeacherRecordDocumentEquality();

  @override
  bool equals(TeacherRecord? e1, TeacherRecord? e2) {
    return e1?.id == e2?.id &&
        e1?.address == e2?.address &&
        e1?.classroom == e2?.classroom &&
        e1?.email == e2?.email &&
        e1?.index == e2?.index &&
        e1?.phone == e2?.phone &&
        e1?.teachingRoom == e2?.teachingRoom;
  }

  @override
  int hash(TeacherRecord? e) => const ListEquality().hash([
        e?.id,
        e?.address,
        e?.classroom,
        e?.email,
        e?.index,
        e?.phone,
        e?.teachingRoom
      ]);

  @override
  bool isValidKey(Object? o) => o is TeacherRecord;
}
