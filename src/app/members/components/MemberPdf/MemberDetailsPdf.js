import NotoSansDevanagari from '@/app/api/helper/static/font/NotoSansDevanagari';
import NotoSansDevanagariBold from '@/app/api/helper/static/font/NotoSansDevanagariBold';
import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import React from 'react';
import { getTrust } from '@/utils/trust/trustStore';
import { DEFAULT_PDF_PRIMARY, DEFAULT_PDF_ACCENT } from '@/utils/trust/theme';
import { fixDevanagariGlyphs } from '@/utils/pdf/fixDevanagariGlyphs';

Font.register({
  family: 'NotoSansDevanagari',
  fonts: [
    { src: NotoSansDevanagari, fontWeight: 'normal' },
    { src: NotoSansDevanagariBold, fontWeight: 'bold' },
  ],
});

// Never split a word across lines. react-pdf's default hyphenation breaks long
// numbers (mobile / Aadhaar) and Devanagari words mid-way, and the broken piece
// was getting clipped — that is why numbers and the address came out incomplete.
Font.registerHyphenationCallback(word => [word]);

// Stops Hindi text (and numbers after it) from losing its last letters — see the helper.
fixDevanagariGlyphs(['NotoSansDevanagari']);

const C = {
  red:   DEFAULT_PDF_ACCENT,    // accent  (Settings → Trust Details → Colours)
  blue:  DEFAULT_PDF_PRIMARY,   // primary (Settings → Trust Details → Colours)
  black: '#222222',
  label: '#666666',
  bg:    '#f9f9f9',
  bdr:   '#dddddd',
  green: '#16a34a',
  orange:'#ea580c',
};

const buildStyles = () => StyleSheet.create({
  page: { backgroundColor: '#ffffff', fontFamily: 'NotoSansDevanagari', padding: 14, paddingBottom: 12 },

  watermark: {
    position: 'absolute', top: '30%', left: '20%',
    width: '60%', opacity: 0.04,
  },

  // ── Header ──
  blessRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 4, paddingHorizontal: 4,
  },
  blessText: { fontSize: 8.5, color: C.red, fontWeight: 'bold' },

  hdr: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 2,
  },
  logoBox: { width: 58, alignItems: 'center', justifyContent: 'center' },
  logoImg: { width: 48, height: 44, borderRadius: 3, objectFit: 'contain' },

  hdrCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  hdrTitle: { fontSize: 14, color: C.blue, fontWeight: 'bold', textAlign: 'center', marginBottom: 1 },
  hdrSub:   { fontSize: 10.5, color: C.blue, fontWeight: 'bold', textAlign: 'center', marginBottom: 2 },
  hdrLine:  { fontSize: 6.8, color: C.black, textAlign: 'center', marginTop: 1 },
  hdrBold:  { fontWeight: 'bold' },
  hdrBlue:  { fontWeight: 'bold', color: C.blue },

  bar: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 3, paddingHorizontal: 2,
    borderBottomWidth: 1.5, borderBottomColor: C.blue,
    marginBottom: 6,
  },
  barText: { fontSize: 8, fontWeight: 'bold', color: C.blue },

  // ── Title + Yojna banner ──
  titleRow: { alignItems: 'center', marginBottom: 6 },
  titleBox: {
    borderWidth: 1.5, borderColor: C.red, borderRadius: 4,
    paddingHorizontal: 22, paddingVertical: 3,
  },
  titleText: { fontSize: 12, fontWeight: 'bold', color: C.red, textAlign: 'center' },

  yojna: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: C.blue, borderRadius: 4,
    marginBottom: 7, overflow: 'hidden',
  },
  yojnaLeft: {
    flex: 1, backgroundColor: C.blue,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  yojnaLbl:  { fontSize: 7, color: '#ffffff', opacity: 0.85 },
  yojnaName: { fontSize: 12, fontWeight: 'bold', color: '#ffffff' },
  yojnaRight: { width: 170, paddingHorizontal: 10, paddingVertical: 4 },
  yojnaKV: { flexDirection: 'row', marginVertical: 1 },
  yojnaK:  { fontSize: 7.5, fontWeight: 'bold', color: C.label, width: 62 },
  yojnaV:  { fontSize: 8.5, fontWeight: 'bold', color: C.black, flexGrow: 1, flexShrink: 1 },

  // ── Card section ──
  card: {
    marginBottom: 6,
    borderWidth: 1, borderColor: C.bdr, borderRadius: 4,
  },
  cardHdr: {
    backgroundColor: C.blue, paddingHorizontal: 8, paddingVertical: 3,
    borderTopLeftRadius: 3, borderTopRightRadius: 3,
  },
  cardHdrText: { fontSize: 9, fontWeight: 'bold', color: '#ffffff' },
  cardBody: { paddingHorizontal: 8, paddingTop: 4, paddingBottom: 2 },

  // ── Photo + key info ──
  keyRow: { flexDirection: 'row', alignItems: 'flex-start' },
  photo: {
    width: 80, height: 96, marginRight: 10,
    borderWidth: 1, borderColor: C.bdr, borderRadius: 4, objectFit: 'cover',
  },
  photoPlaceholder: {
    width: 80, height: 96, marginRight: 10,
    backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: C.bdr, borderRadius: 4,
    alignItems: 'center', justifyContent: 'center',
  },
  photoPlaceholderText: { fontSize: 7, color: '#999' },
  keyInfo: { flexGrow: 1, flexShrink: 1 },

  // ── Field grid ──
  // Every value is flexGrow/flexShrink with flexBasis 0 so it always takes the
  // remaining width and wraps onto a new line instead of being clipped.
  fRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5, borderBottomColor: '#eeeeee',
    paddingVertical: 2.5,
  },
  fRowLast: { borderBottomWidth: 0 },
  fCell:     { width: '50%', flexDirection: 'row', alignItems: 'flex-start', paddingRight: 6 },
  fCellFull: { width: '100%', flexDirection: 'row', alignItems: 'flex-start' },
  fLbl:  { fontSize: 7.5, fontWeight: 'bold', color: C.label, width: 72 },
  fVal:  { fontSize: 8, color: C.black, flexGrow: 1, flexShrink: 1, flexBasis: 0 },
  fValBig: { fontSize: 10.5, fontWeight: 'bold', color: C.black, flexGrow: 1, flexShrink: 1, flexBasis: 0 },
  fValNum: { fontSize: 9, fontWeight: 'bold', color: C.black, flexGrow: 1, flexShrink: 1, flexBasis: 0, letterSpacing: 0.3 },

  // ── Guardian ──
  guardPhoto: {
    width: 52, height: 60, marginRight: 10,
    borderWidth: 1, borderColor: C.bdr, borderRadius: 4, objectFit: 'cover',
  },
  guardPlaceholder: {
    width: 52, height: 60, marginRight: 10,
    backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: C.bdr, borderRadius: 4,
    alignItems: 'center', justifyContent: 'center',
  },

  // ── Documents ──
  docsWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 1 },
  docCard: {
    width: '15.6%', marginBottom: 3, marginRight: '1%',
    borderWidth: 0.5, borderColor: C.bdr, borderRadius: 3,
    alignItems: 'center', padding: 2,
  },
  docImg: { width: '100%', height: 38, objectFit: 'cover', borderRadius: 2 },
  docLbl: { fontSize: 5.8, color: C.label, textAlign: 'center', marginTop: 2 },

  // ── Fees row ──
  feesRow: {
    flexDirection: 'row', marginTop: 3, paddingTop: 4, paddingBottom: 2,
    borderTopWidth: 0.5, borderTopColor: C.bdr,
  },
  feeItem: { flex: 1, alignItems: 'center' },
  feeVal: { fontSize: 9.5, fontWeight: 'bold' },
  feeLbl: { fontSize: 6.5, color: C.label, marginTop: 1 },

  // ── Signature + Footer ──
  spacer: { flexGrow: 1 },
  signRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, paddingHorizontal: 4 },
  signText: { fontSize: 8.5, fontWeight: 'bold', color: C.blue },

  footer: {
    borderTopWidth: 1, borderTopColor: C.red,
    paddingTop: 4, marginTop: 4,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerCenter: { flex: 1, alignItems: 'center' },
  footerContact: { fontSize: 8, fontWeight: 'bold', color: C.red, textAlign: 'center', marginBottom: 1 },
  footerSub:     { fontSize: 8, fontWeight: 'bold', color: C.blue, textAlign: 'center' },
  footerEoe:     { fontSize: 8, fontWeight: 'bold', color: C.black, width: 50, textAlign: 'right' },
});

// Styles are built by a function so the two brand colours can change.
let styles = buildStyles();
let pdfColorKey = '';

// PDF colours come from Settings → Trust Details → Colours.
const applyPdfColors = (trust) => {
  const key = `${trust.pdfColorPrimary}|${trust.pdfColorAccent}`;
  if (key === pdfColorKey) return;
  pdfColorKey = key;
  C.blue = trust.pdfColorPrimary;
  C.red = trust.pdfColorAccent;
  styles = buildStyles();
};

const has = (v) => v !== undefined && v !== null && String(v).trim() !== '';
const show = (v) => (has(v) ? String(v) : '—');

// 123456789012 → "1234 5678 9012" (anything that isn't 12 digits is shown as-is)
const fmtAadhaar = (v) => {
  const d = String(v || '').replace(/\D/g, '');
  return d.length === 12 ? `${d.slice(0, 4)} ${d.slice(4, 8)} ${d.slice(8)}` : show(v);
};
const fmtPhones = (a, b) => [a, b].filter(has).join(' , ') || '—';
const rupee = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

// Half-width field (two per row)
const F = ({ label, value, num }) => (
  <View style={styles.fCell}>
    <Text style={styles.fLbl}>{label}</Text>
    <Text style={num ? styles.fValNum : styles.fVal}>{show(value)}</Text>
  </View>
);
// Full-width field (one per row) — used for anything that can be long
const FF = ({ label, value, big, num, last }) => (
  <View style={[styles.fRow, last && styles.fRowLast]} wrap={false}>
    <View style={styles.fCellFull}>
      <Text style={styles.fLbl}>{label}</Text>
      <Text style={big ? styles.fValBig : num ? styles.fValNum : styles.fVal}>{show(value)}</Text>
    </View>
  </View>
);
const Row = ({ children, last }) => (
  <View style={[styles.fRow, last && styles.fRowLast]} wrap={false}>{children}</View>
);
const Card = ({ title, children }) => (
  <View style={styles.card} wrap={false}>
    <View style={styles.cardHdr}><Text style={styles.cardHdrText}>{title}</Text></View>
    <View style={styles.cardBody}>{children}</View>
  </View>
);

const MemberDetailsPdf = ({ member }) => {
  fixDevanagariGlyphs(['NotoSansDevanagari']);
  const trust = getTrust();
  applyPdfColors(trust);
  if (!member) return null;

  const docItems = [
    { label: 'सदस्य फोटो',           url: member.photoURL },
    { label: 'वारिसदार फोटो',         url: member.guardianPhotoURL },
    { label: 'सदस्य दस्तावेज (आगे)',    url: member.documentFrontURL },
    { label: 'सदस्य दस्तावेज (पीछे)',   url: member.documentBackURL },
    { label: 'वारिसदार दस्तावेज (आगे)', url: member.guardianDocumentURL },
    { label: 'वारिसदार दस्तावेज (पीछे)', url: member.guardianDocumentBackURL },
  ].filter(d => d.url);

  const period = has(member.periodStartDate)
    ? `${member.periodStartDate} से ${member.periodEndDate || ''}`
    : null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {trust.logoSrc ? <Image src={trust.logoSrc} style={styles.watermark} fixed /> : null}

        {/* ═══ Trust header ═══ */}
        <View style={styles.blessRow}>
          {(trust.blessings || []).map((line, i) => (<Text key={i} style={styles.blessText}>{line}</Text>))}
        </View>

        <View style={styles.hdr}>
          <View style={styles.logoBox}>
            {trust.logoSrc ? <Image src={trust.logoSrc} style={styles.logoImg} /> : null}
          </View>
          <View style={styles.hdrCenter}>
            <Text style={styles.hdrTitle}>{trust.name}</Text>
            {has(trust.cityLine) && <Text style={styles.hdrSub}>{trust.cityLine}</Text>}
            {has(trust.addressWithOffice) && (
              <Text style={styles.hdrLine}>
                <Text style={styles.hdrBold}>हेड ऑफिस : </Text>{trust.addressWithOffice}
              </Text>
            )}
            <Text style={styles.hdrLine}>
              <Text style={styles.hdrBold}>संपर्क सूत्र : </Text>
              <Text style={styles.hdrBlue}>{[trust.presidentName, trust.presidentPhone].filter(has).join('  ')}</Text>
              {has(trust.officePhone) && <Text style={styles.hdrBold}>{'    ऑफिस : '}</Text>}
              {has(trust.officePhone) && <Text style={styles.hdrBlue}>{trust.officePhone}</Text>}
            </Text>
          </View>
          <View style={styles.logoBox}>
            {trust.rightImageSrc ? <Image src={trust.rightImageSrc} style={styles.logoImg} /> : null}
          </View>
        </View>

        <View style={styles.bar}>
          <Text style={styles.barText}>{trust.sinceText}</Text>
          <Text style={styles.barText}>{trust.regText}</Text>
        </View>

        {/* ═══ Title ═══ */}
        <View style={styles.titleRow}>
          <View style={styles.titleBox}>
            <Text style={styles.titleText}>सदस्य विवरण पत्र</Text>
          </View>
        </View>

        {/* ═══ Yojna banner — the first thing under the title ═══ */}
        <View style={styles.yojna} wrap={false}>
          <View style={styles.yojnaLeft}>
            <Text style={styles.yojnaLbl}>योजना</Text>
            <Text style={styles.yojnaName}>{show(member.programName)}</Text>
          </View>
          <View style={styles.yojnaRight}>
            <View style={styles.yojnaKV}>
              <Text style={styles.yojnaK}>सदस्य क्र.</Text>
              <Text style={styles.yojnaV}>{show(member.registrationNumber)}</Text>
            </View>
            <View style={styles.yojnaKV}>
              <Text style={styles.yojnaK}>पंजीयन तिथि</Text>
              <Text style={styles.yojnaV}>{show(member.dateJoin)}</Text>
            </View>
            {has(member.ageGroupName || member.ageGroup) && (
              <View style={styles.yojnaKV}>
                <Text style={styles.yojnaK}>आयु वर्ग</Text>
                <Text style={styles.yojnaV}>{show(member.ageGroupName || member.ageGroup)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ═══ Sadasya vivaran — photo + key identity ═══ */}
        <Card title="सदस्य विवरण">
          <View style={styles.keyRow}>
            {member.photoURL ? (
              <Image src={member.photoURL} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>No Photo</Text>
              </View>
            )}
            <View style={styles.keyInfo}>
              <FF label="सदस्य का नाम" value={member.displayName} big />
              <FF label="पिता / पति का नाम" value={member.fatherName} />
              <FF label="मोबाइल नं." value={fmtPhones(member.phone, member.phoneAlt)} num />
              <FF label="आधार नं." value={fmtAadhaar(member.aadhaarNo)} num />
              <Row last>
                <F label="जन्म तिथि" value={member.dobDate} />
                <F label="आयु" value={has(member.age) ? member.age + ' वर्ष' : null} />
              </Row>
            </View>
          </View>
        </Card>

        {/* ═══ Personal + address ═══ */}
        <Card title="व्यक्तिगत एवं पता जानकारी">
          <Row>
            <F label="उपनाम (गोत्र)" value={member.surname} />
            <F label="जाति" value={member.caste} />
          </Row>
          <Row>
            <F label="वैवाहिक स्थिति" value={member.marriage_flag ? 'विवाहित' : 'अविवाहित'} />
            <F label="पिन कोड" value={member.pinCode} />
          </Row>
          <FF label="पता" value={member.currentAddress} />
          <Row>
            <F label="गाँव" value={member.village} />
            <F label="शहर" value={member.city} />
          </Row>
          <Row last>
            <F label="जिला" value={member.district} />
            <F label="राज्य" value={member.state} />
          </Row>
        </Card>

        {/* ═══ Yojna / fees ═══ */}
        <Card title="योजना एवं शुल्क विवरण">
          <Row last>
            <F label="भुगतान राशि" value={has(member.payAmount) ? rupee(member.payAmount) : null} />
            <F label="अवधि" value={period} />
          </Row>
          <View style={styles.feesRow}>
            <View style={styles.feeItem}>
              <Text style={[styles.feeVal, { color: C.blue }]}>{rupee(member.joinFees)}</Text>
              <Text style={styles.feeLbl}>कुल शुल्क</Text>
            </View>
            <View style={styles.feeItem}>
              <Text style={[styles.feeVal, { color: C.green }]}>{rupee(member.paidAmount)}</Text>
              <Text style={styles.feeLbl}>भुगतान</Text>
            </View>
            <View style={styles.feeItem}>
              <Text style={[styles.feeVal, { color: (member.pendingAmount || 0) > 0 ? C.orange : C.green }]}>
                {rupee(member.pendingAmount)}
              </Text>
              <Text style={styles.feeLbl}>बकाया</Text>
            </View>
            <View style={styles.feeItem}>
              <Text style={[styles.feeVal, { color: (member.paymentPercentage || 0) >= 100 ? C.green : C.orange }]}>
                {member.paymentPercentage || 0}%
              </Text>
              <Text style={styles.feeLbl}>प्रतिशत</Text>
            </View>
          </View>
        </Card>

        {/* ═══ Nominee / Varisdar ═══ */}
        <Card title="नॉमिनी / वारिसदार विवरण">
          <View style={styles.keyRow}>
            {member.guardianPhotoURL ? (
              <Image src={member.guardianPhotoURL} style={styles.guardPhoto} />
            ) : (
              <View style={styles.guardPlaceholder}>
                <Text style={{ fontSize: 6, color: '#999' }}>N/A</Text>
              </View>
            )}
            <View style={styles.keyInfo}>
              <FF label="नाम" value={member.guardian} />
              <FF label="संबंध" value={member.guardianRelation} />
              <FF label="आधार नं." value={fmtAadhaar(member.guardianAadhaarNo)} num last />
            </View>
          </View>
        </Card>

        {/* ═══ Documents ═══ */}
        {docItems.length > 0 && (
          <Card title={`दस्तावेज (${docItems.length})`}>
            <View style={styles.docsWrap}>
              {docItems.map((d, i) => (
                <View key={i} style={styles.docCard}>
                  {d.url.toLowerCase().includes('.pdf') ? (
                    <View style={{ width: '100%', height: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff0f0', borderRadius: 2 }}>
                      <Text style={{ fontSize: 6, color: C.red, fontWeight: 'bold' }}>PDF</Text>
                    </View>
                  ) : (
                    <Image src={d.url} style={styles.docImg} />
                  )}
                  <Text style={styles.docLbl}>{d.label}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        <View style={styles.spacer} />

        <View wrap={false}>
          <View style={styles.signRow}>
            <Text style={styles.signText}>संस्थापक हस्ताक्षर</Text>
          </View>
          <View style={styles.footer}>
            <View style={{ width: 50 }} />
            <View style={styles.footerCenter}>
              <Text style={styles.footerContact}>संपर्क सूत्र : {trust.contactNumbers}</Text>
              <Text style={styles.footerSub}>{trust.jurisdiction}</Text>
            </View>
            <Text style={styles.footerEoe}>E. &amp; O.E.</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default MemberDetailsPdf;
