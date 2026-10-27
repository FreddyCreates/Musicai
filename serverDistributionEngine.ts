import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Persistence directory
const DATA_DIR = path.join(process.cwd(), 'data_distribution');

export interface DistributionRelease {
  id: string;
  slug: string;
  title: string;
  artistName: string;
  featuredArtists: string[];
  label: string;
  genre: string;
  subgenre: string;
  primaryLanguage: string;
  explicit: 'explicit' | 'clean' | 'not_explicit';
  releaseType: 'single' | 'ep' | 'album';
  releaseDate: string;
  originalReleaseDate: string;
  upc: string;
  isrc: string;
  coverArtUrl: string;
  audioUrl: string;
  bpm: number;
  musicalKey: string;
  durationSec: number;
  audioFingerprint: string;
  targetDSPs: string[];
  status: 'draft' | 'qc_passed' | 'ddex_packaged' | 'delivering' | 'live';
  createdAt: string;
  updatedAt: string;
  stats: {
    totalStreams: number;
    totalEarningsUsd: number;
    preSaves: number;
    smartLinkClicks: number;
    byDsp: Record<string, { streams: number; earningsUsd: number }>;
    byCountry: Record<string, number>;
  };
}

export interface RoyaltySplit {
  id: string;
  releaseId: string;
  recipientName: string;
  email: string;
  role: 'songwriter' | 'producer' | 'featured_artist' | 'master_owner' | 'label';
  percentage: number;
  recoupmentAmountUsd?: number;
  recoupedSoFarUsd?: number;
  payoutMethod: 'stripe' | 'paypal' | 'bank_wire';
  payoutAccount: string;
  status: 'active' | 'pending_confirmation';
}

export interface BankLedger {
  availableBalanceUsd: number;
  pendingBalanceUsd: number;
  lifetimeEarningsUsd: number;
  totalWithdrawnUsd: number;
  payouts: Array<{
    id: string;
    date: string;
    amountUsd: number;
    destination: string;
    method: string;
    status: 'completed' | 'processing';
    referenceId: string;
  }>;
}

export interface WhitelistedChannel {
  id: string;
  platform: 'youtube' | 'tiktok' | 'instagram';
  channelName: string;
  channelUrlOrHandle: string;
  releaseId?: string; // Optional: all releases or specific
  whitelistedAt: string;
  status: 'active' | 'pending';
}

export class DistributionEngine {
  private static releasesFile = path.join(DATA_DIR, 'releases.json');
  private static splitsFile = path.join(DATA_DIR, 'splits.json');
  private static bankFile = path.join(DATA_DIR, 'bank.json');
  private static whitelistFile = path.join(DATA_DIR, 'whitelist.json');

  public static init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(this.releasesFile)) {
      // Seed with initial demo catalog release
      const initialReleases: DistributionRelease[] = [
        {
          id: 'rel_cor_2026_001',
          slug: 'el-general-firme',
          title: 'El General Firme (Master 2026)',
          artistName: 'Alfredo Medina & Los Reyes',
          featuredArtists: ['Requinto 12 Cuerdas Soloist'],
          label: 'Sovereign Records LLC',
          genre: 'Regional Mexican / Bélico Tumbado',
          subgenre: 'Corridos Bélicos 2026',
          primaryLanguage: 'es',
          explicit: 'not_explicit',
          releaseType: 'single',
          releaseDate: new Date().toISOString().split('T')[0],
          originalReleaseDate: new Date().toISOString().split('T')[0],
          upc: this.generateUPC(),
          isrc: this.generateISRC(),
          coverArtUrl: '/assets/corrido_art.jpg',
          audioUrl: '/audio/pura_lumbre_1773738012675.wav',
          bpm: 144,
          musicalKey: 'G Major',
          durationSec: 138,
          audioFingerprint: crypto.createHash('sha256').update('rel_cor_2026_001_audio').digest('hex'),
          targetDSPs: [
            'spotify', 'apple_music', 'youtube_music', 'tiktok', 'instagram_meta',
            'amazon_music', 'tidal', 'deezer', 'pandora', 'iheartradio', 'tencent_music'
          ],
          status: 'live',
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          updatedAt: new Date().toISOString(),
          stats: {
            totalStreams: 18450,
            totalEarningsUsd: 74.28,
            preSaves: 342,
            smartLinkClicks: 2150,
            byDsp: {
              spotify: { streams: 11200, earningsUsd: 43.68 },
              apple_music: { streams: 4100, earningsUsd: 28.70 },
              youtube_music: { streams: 2350, earningsUsd: 4.70 },
              tiktok: { streams: 800, earningsUsd: 0.20 },
            },
            byCountry: {
              US: 11050,
              MX: 6200,
              CO: 750,
              GT: 450
            }
          }
        }
      ];
      fs.writeFileSync(this.releasesFile, JSON.stringify(initialReleases, null, 2));
    }

    if (!fs.existsSync(this.splitsFile)) {
      const initialSplits: RoyaltySplit[] = [
        {
          id: 'splt_001',
          releaseId: 'rel_cor_2026_001',
          recipientName: 'Alfredo Medina (Artist / Primary Songwriter)',
          email: 'AlfredoJrMedi@gmail.com',
          role: 'songwriter',
          percentage: 60.0,
          payoutMethod: 'stripe',
          payoutAccount: 'acct_stripe_primary_01',
          status: 'active'
        },
        {
          id: 'splt_002',
          releaseId: 'rel_cor_2026_001',
          recipientName: 'Master Studio Producer & Requinto Lead',
          email: 'producer@sovereignrecords.com',
          role: 'producer',
          percentage: 30.0,
          payoutMethod: 'bank_wire',
          payoutAccount: 'chase_wire_9920',
          status: 'active'
        },
        {
          id: 'splt_003',
          releaseId: 'rel_cor_2026_001',
          recipientName: 'Sovereign Label Vault',
          email: 'vault@sovereignrecords.com',
          role: 'label',
          percentage: 10.0,
          payoutMethod: 'stripe',
          payoutAccount: 'acct_stripe_vault',
          status: 'active'
        }
      ];
      fs.writeFileSync(this.splitsFile, JSON.stringify(initialSplits, null, 2));
    }

    if (!fs.existsSync(this.bankFile)) {
      const initialBank: BankLedger = {
        availableBalanceUsd: 74.28,
        pendingBalanceUsd: 142.50,
        lifetimeEarningsUsd: 316.78,
        totalWithdrawnUsd: 100.00,
        payouts: [
          {
            id: 'po_0911_882',
            date: '2026-09-01',
            amountUsd: 100.00,
            destination: 'AlfredoJrMedi@gmail.com (Stripe Express)',
            method: 'stripe',
            status: 'completed',
            referenceId: 'STRIPE_TR_882910481'
          }
        ]
      };
      fs.writeFileSync(this.bankFile, JSON.stringify(initialBank, null, 2));
    }

    if (!fs.existsSync(this.whitelistFile)) {
      const initialWhitelist: WhitelistedChannel[] = [
        {
          id: 'wl_001',
          platform: 'youtube',
          channelName: 'Alfredo Medina Official Channel',
          channelUrlOrHandle: 'https://youtube.com/@AlfredoMedinaOfficial',
          whitelistedAt: new Date().toISOString(),
          status: 'active'
        }
      ];
      fs.writeFileSync(this.whitelistFile, JSON.stringify(initialWhitelist, null, 2));
    }
  }

  // --- UPC Generator with GS1 Modulo-10 Check Digit ---
  public static generateUPC(): string {
    // 12-digit UPC-A: 11 data digits + 1 check digit
    // Company Prefix / Registrant: '840' + 8 random digits
    const prefix = '840';
    let digits = prefix;
    for (let i = 0; i < 8; i++) {
      digits += Math.floor(Math.random() * 10).toString();
    }
    // Calculate check digit:
    // 1. Sum digits at odd positions (1, 3, 5, 7, 9, 11) -> 0, 2, 4, 6, 8, 10 in 0-indexed
    let oddSum = 0;
    let evenSum = 0;
    for (let i = 0; i < 11; i++) {
      const d = parseInt(digits[i], 10);
      if (i % 2 === 0) {
        oddSum += d;
      } else {
        evenSum += d;
      }
    }
    const total = oddSum * 3 + evenSum;
    const checkDigit = (10 - (total % 10)) % 10;
    return `${digits}${checkDigit}`;
  }

  // --- ISRC Generator adhering to ISO 3901 Standard ---
  public static generateISRC(country = 'US', registrant = 'MT7', year = '26'): string {
    // Format: CC-XXX-YY-NNNNN
    const designation = Math.floor(10000 + Math.random() * 90000).toString();
    return `${country}-${registrant}-${year}-${designation}`;
  }

  // --- Database Accessors ---
  public static getAllReleases(): DistributionRelease[] {
    this.init();
    try {
      const data = fs.readFileSync(this.releasesFile, 'utf8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public static getReleaseById(id: string): DistributionRelease | null {
    const releases = this.getAllReleases();
    return releases.find(r => r.id === id || r.slug === id) || null;
  }

  public static saveRelease(releaseData: Partial<DistributionRelease>): DistributionRelease {
    const releases = this.getAllReleases();
    const now = new Date().toISOString();

    if (releaseData.id) {
      const idx = releases.findIndex(r => r.id === releaseData.id);
      if (idx >= 0) {
        const updated: DistributionRelease = {
          ...releases[idx],
          ...releaseData,
          updatedAt: now
        } as DistributionRelease;
        releases[idx] = updated;
        fs.writeFileSync(this.releasesFile, JSON.stringify(releases, null, 2));
        return updated;
      }
    }

    // New Release creation
    const newId = `rel_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const titleSlug = (releaseData.title || 'untitled-single')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const slug = `${titleSlug}-${Math.random().toString(36).substring(2, 6)}`;

    const newRelease: DistributionRelease = {
      id: newId,
      slug,
      title: releaseData.title || 'Untitled Master Single',
      artistName: releaseData.artistName || 'Artista Principal',
      featuredArtists: releaseData.featuredArtists || [],
      label: releaseData.label || 'Sovereign Records LLC',
      genre: releaseData.genre || 'Regional Mexican',
      subgenre: releaseData.subgenre || 'Corridos Bélicos',
      primaryLanguage: releaseData.primaryLanguage || 'es',
      explicit: releaseData.explicit || 'not_explicit',
      releaseType: releaseData.releaseType || 'single',
      releaseDate: releaseData.releaseDate || now.split('T')[0],
      originalReleaseDate: releaseData.originalReleaseDate || now.split('T')[0],
      upc: releaseData.upc || this.generateUPC(),
      isrc: releaseData.isrc || this.generateISRC(),
      coverArtUrl: releaseData.coverArtUrl || '/assets/default_cover.jpg',
      audioUrl: releaseData.audioUrl || '',
      bpm: releaseData.bpm || 144,
      musicalKey: releaseData.musicalKey || 'G Major',
      durationSec: releaseData.durationSec || 120,
      audioFingerprint: crypto.createHash('sha256').update(`${newId}_${releaseData.title}_audio`).digest('hex'),
      targetDSPs: releaseData.targetDSPs || [
        'spotify', 'apple_music', 'youtube_music', 'tiktok', 'instagram_meta',
        'amazon_music', 'tidal', 'deezer'
      ],
      status: 'ddex_packaged',
      createdAt: now,
      updatedAt: now,
      stats: {
        totalStreams: 0,
        totalEarningsUsd: 0,
        preSaves: 0,
        smartLinkClicks: 0,
        byDsp: {},
        byCountry: {}
      }
    };

    releases.unshift(newRelease);
    fs.writeFileSync(this.releasesFile, JSON.stringify(releases, null, 2));

    // Also bootstrap default 100% split if not present
    this.createOrUpdateSplits(newId, [
      {
        id: `splt_${Date.now()}`,
        releaseId: newId,
        recipientName: newRelease.artistName,
        email: 'artist@sovereignrecords.com',
        role: 'songwriter',
        percentage: 100.0,
        payoutMethod: 'stripe',
        payoutAccount: 'default_primary',
        status: 'active'
      }
    ]);

    return newRelease;
  }

  // --- Splits Manager ---
  public static getSplitsForRelease(releaseId: string): RoyaltySplit[] {
    this.init();
    try {
      const data = fs.readFileSync(this.splitsFile, 'utf8');
      const all: RoyaltySplit[] = JSON.parse(data);
      return all.filter(s => s.releaseId === releaseId);
    } catch {
      return [];
    }
  }

  public static createOrUpdateSplits(releaseId: string, splits: RoyaltySplit[]): { success: boolean; totalPercent: number; splits: RoyaltySplit[]; error?: string } {
    this.init();
    const totalPercent = splits.reduce((acc, curr) => acc + Number(curr.percentage || 0), 0);

    // Validate percentage sum
    if (Math.abs(totalPercent - 100.0) > 0.01) {
      return {
        success: false,
        totalPercent,
        splits,
        error: `Las divisiones deben sumar exactamente el 100.0%. Suma actual: ${totalPercent.toFixed(1)}%`
      };
    }

    try {
      const raw = fs.readFileSync(this.splitsFile, 'utf8');
      let allSplits: RoyaltySplit[] = JSON.parse(raw);
      // Remove previous splits for this release
      allSplits = allSplits.filter(s => s.releaseId !== releaseId);
      // Add new splits
      const finalized = splits.map(s => ({
        ...s,
        id: s.id || `splt_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        releaseId,
        status: s.status || 'active'
      }));
      allSplits.push(...finalized);
      fs.writeFileSync(this.splitsFile, JSON.stringify(allSplits, null, 2));

      return { success: true, totalPercent: 100.0, splits: finalized };
    } catch (e: any) {
      return { success: false, totalPercent, splits, error: e.message };
    }
  }

  // --- The Bank & Financial Ledger ---
  public static getBankLedger(): BankLedger {
    this.init();
    try {
      const raw = fs.readFileSync(this.bankFile, 'utf8');
      return JSON.parse(raw);
    } catch {
      return {
        availableBalanceUsd: 0,
        pendingBalanceUsd: 0,
        lifetimeEarningsUsd: 0,
        totalWithdrawnUsd: 0,
        payouts: []
      };
    }
  }

  public static requestPayout(amountUsd: number, destination: string, method: string): { success: boolean; payout?: any; error?: string } {
    const bank = this.getBankLedger();
    if (amountUsd <= 0) {
      return { success: false, error: 'El monto a retirar debe ser mayor a $0.00 USD' };
    }
    if (amountUsd > bank.availableBalanceUsd) {
      return { success: false, error: `Saldo insuficiente. Saldo disponible: $${bank.availableBalanceUsd.toFixed(2)} USD` };
    }

    const payout = {
      id: `po_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amountUsd,
      destination,
      method: method || 'stripe',
      status: 'completed' as const,
      referenceId: `REF_${crypto.randomBytes(6).toString('hex').toUpperCase()}`
    };

    bank.availableBalanceUsd = parseFloat((bank.availableBalanceUsd - amountUsd).toFixed(2));
    bank.totalWithdrawnUsd = parseFloat((bank.totalWithdrawnUsd + amountUsd).toFixed(2));
    bank.payouts.unshift(payout);

    fs.writeFileSync(this.bankFile, JSON.stringify(bank, null, 2));
    return { success: true, payout };
  }

  // --- YouTube / Content ID Whitelist ---
  public static getWhitelistedChannels(): WhitelistedChannel[] {
    this.init();
    try {
      const raw = fs.readFileSync(this.whitelistFile, 'utf8');
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public static addWhitelistedChannel(platform: 'youtube' | 'tiktok' | 'instagram', channelName: string, handle: string): WhitelistedChannel {
    const list = this.getWhitelistedChannels();
    const item: WhitelistedChannel = {
      id: `wl_${Date.now()}`,
      platform,
      channelName,
      channelUrlOrHandle: handle,
      whitelistedAt: new Date().toISOString(),
      status: 'active'
    };
    list.unshift(item);
    fs.writeFileSync(this.whitelistFile, JSON.stringify(list, null, 2));
    return item;
  }

  // --- HyperFollow & Pre-Save Tracker ---
  public static recordSmartLinkClick(releaseId: string): boolean {
    const releases = this.getAllReleases();
    const rel = releases.find(r => r.id === releaseId || r.slug === releaseId);
    if (!rel) return false;
    rel.stats.smartLinkClicks = (rel.stats.smartLinkClicks || 0) + 1;
    fs.writeFileSync(this.releasesFile, JSON.stringify(releases, null, 2));
    return true;
  }

  public static recordPreSave(releaseId: string, dsp: string, email: string): { success: boolean; count: number } {
    const releases = this.getAllReleases();
    const rel = releases.find(r => r.id === releaseId || r.slug === releaseId);
    if (!rel) return { success: false, count: 0 };
    rel.stats.preSaves = (rel.stats.preSaves || 0) + 1;
    fs.writeFileSync(this.releasesFile, JSON.stringify(releases, null, 2));
    return { success: true, count: rel.stats.preSaves };
  }

  // --- DDEX ERN 4.2 Standard Electronic Release Notification XML Generator ---
  public static generateDDEXXml(release: DistributionRelease): string {
    const messageId = `DDEX_MSG_${release.id}_${Date.now()}`;
    const messageCreated = new Date().toISOString();
    const sanitizedTitle = (release.title || 'Untitled').replace(/[<>&'"]/g, '');
    const sanitizedArtist = (release.artistName || 'Main Artist').replace(/[<>&'"]/g, '');
    const sanitizedLabel = (release.label || 'Sovereign Records').replace(/[<>&'"]/g, '');

    return `<?xml version="1.0" encoding="UTF-8"?>
<ern:NewReleaseMessage 
  xmlns:ern="http://ddex.net/xml/ern/42" 
  xmlns:xs="http://www.w3.org/2001/XMLSchema-instance"
  MessageSchemaVersionId="ern/42"
  LanguageAndScriptCode="es"
  ReleaseProfileVersionId="CommonReleaseTypes/14/AudioSingle">
  
  <!-- DDEX ERN 4.2 Standard Release Manifest Generated by Sovereign Distribution Engine -->
  <MessageHeader>
    <MessageThreadId>${release.id}</MessageThreadId>
    <MessageId>${messageId}</MessageId>
    <MessageSender>
      <PartyId Namespace="PADPIDA">PADPIDA2026SOVEREIGN</PartyId>
      <PartyName>
        <FullName>Sovereign Distribution Engine &amp; Medina Tech</FullName>
      </PartyName>
    </MessageSender>
    <MessageRecipient>
      <PartyId Namespace="PADPIDA">PADPIDASPOTIFYGLOBAL</PartyId>
      <PartyName>
        <FullName>Worldwide DSP Network (Spotify, Apple Music, YouTube, Amazon, TikTok)</FullName>
      </PartyName>
    </MessageRecipient>
    <MessageCreatedDateTime>${messageCreated}</MessageCreatedDateTime>
    <Comment>Official Digital Ingestion Package for ${sanitizedTitle}</Comment>
  </MessageHeader>

  <PartyList>
    <Party>
      <PartyReference>PARTY_MAIN_ARTIST</PartyReference>
      <PartyName>
        <FullName>${sanitizedArtist}</FullName>
      </PartyName>
    </Party>
    <Party>
      <PartyReference>PARTY_LABEL</PartyReference>
      <PartyName>
        <FullName>${sanitizedLabel}</FullName>
      </PartyName>
    </Party>
  </PartyList>

  <ResourceList>
    <SoundRecording>
      <SoundRecordingType>MusicalWorkSoundRecording</SoundRecordingType>
      <SoundRecordingId>
        <ISRC>${release.isrc}</ISRC>
      </SoundRecordingId>
      <ResourceReference>A1</ResourceReference>
      <ReferenceTitle>
        <TitleText>${sanitizedTitle}</TitleText>
      </ReferenceTitle>
      <Duration>PT${Math.floor(release.durationSec / 60)}M${release.durationSec % 60}S</Duration>
      <SoundRecordingDetailsByTerritory>
        <TerritoryCode>Worldwide</TerritoryCode>
        <Title>
          <TitleText>${sanitizedTitle}</TitleText>
        </Title>
        <DisplayArtist>
          <PartyName>
            <FullName>${sanitizedArtist}</FullName>
          </PartyName>
          <ArtistRole>MainArtist</ArtistRole>
        </DisplayArtist>
        <LabelName>${sanitizedLabel}</LabelName>
        <RightsAgreementId>SOV-AGR-${release.id}</RightsAgreementId>
        <PLine>
          <Year>${new Date().getFullYear()}</Year>
          <PLineCompany>${sanitizedLabel}</PLineCompany>
        </PLine>
        <Genre>
          <GenreText>${release.genre}</GenreText>
          <SubGenre>${release.subgenre}</SubGenre>
        </Genre>
        <ParentalWarningType>${release.explicit === 'explicit' ? 'Explicit' : 'NotExplicit'}</ParentalWarningType>
        <TechnicalDetails>
          <TechnicalResourceDetailsReference>T1</TechnicalResourceDetailsReference>
          <AudioCodecType>PCM_WAV</AudioCodecType>
          <BitRate>2116000</BitRate>
          <OriginalSamplingRate>44100</OriginalSamplingRate>
          <OriginalBitDepth>24</OriginalBitDepth>
          <NumberOfChannels>2</NumberOfChannels>
          <Fingerprint>
            <FingerprintAlgorithm>SHA256_ACOUSTIC</FingerprintAlgorithm>
            <FingerprintValue>${release.audioFingerprint}</FingerprintValue>
          </Fingerprint>
        </TechnicalDetails>
      </SoundRecordingDetailsByTerritory>
    </SoundRecording>

    <Image>
      <ImageType>FrontCoverImage</ImageType>
      <ImageId>
        <ProprietaryId Namespace="SOVEREIGN">${release.id}_COVER</ProprietaryId>
      </ImageId>
      <ResourceReference>IMG1</ResourceReference>
      <TechnicalImageDetails>
        <TechnicalResourceDetailsReference>T_IMG1</TechnicalResourceDetailsReference>
        <ImageCodecType>JPEG</ImageCodecType>
        <ImageHeight>3000</ImageHeight>
        <ImageWidth>3000</ImageWidth>
        <ColorDepth>24</ColorDepth>
      </TechnicalImageDetails>
    </Image>
  </ResourceList>

  <ReleaseList>
    <Release>
      <ReleaseId>
        <ICPN>${release.upc}</ICPN>
        <CatalogNumber>SOV-${release.id.substring(4, 10).toUpperCase()}</CatalogNumber>
      </ReleaseId>
      <ReleaseReference>R0</ReleaseReference>
      <ReferenceTitle>
        <TitleText>${sanitizedTitle}</TitleText>
      </ReferenceTitle>
      <ReleaseResourceReferenceList>
        <ReleaseResourceReference ReleaseResourceType="PrimaryResource">A1</ReleaseResourceReference>
        <ReleaseResourceReference ReleaseResourceType="SecondaryResource">IMG1</ReleaseResourceReference>
      </ReleaseResourceReferenceList>
      <ReleaseType>Single</ReleaseType>
      <ReleaseDetailsByTerritory>
        <TerritoryCode>Worldwide</TerritoryCode>
        <DisplayArtistName>${sanitizedArtist}</DisplayArtistName>
        <LabelName>${sanitizedLabel}</LabelName>
        <OriginalReleaseDate>${release.releaseDate}</OriginalReleaseDate>
        <CLine>
          <Year>${new Date().getFullYear()}</Year>
          <CLineCompany>${sanitizedLabel}</CLineCompany>
        </CLine>
      </ReleaseDetailsByTerritory>
    </Release>
  </ReleaseList>

  <DealList>
    <ReleaseDeal>
      <DealReleaseReference>R0</DealReleaseReference>
      <Deal>
        <DealTerms>
          <CommercialModelType>SubscriptionModel</CommercialModelType>
          <CommercialModelType>AdSupportedModel</CommercialModelType>
          <CommercialModelType>PayAsYouGoModel</CommercialModelType>
          <Usage>
            <UseType>Stream</UseType>
            <UseType>PermanentDownload</UseType>
            <UseType>ConditionalDownload</UseType>
            <UseType>SocialMediaSynchronization</UseType>
          </Usage>
          <TerritoryCode>Worldwide</TerritoryCode>
          <ValidityPeriod>
            <StartDate>${release.releaseDate}</StartDate>
          </ValidityPeriod>
        </DealTerms>
      </Deal>
    </ReleaseDeal>
  </DealList>
</ern:NewReleaseMessage>`;
  }

  // --- CSV Royalty Report Generator ---
  public static generateRoyaltyCSV(releaseId?: string): string {
    const releases = this.getAllReleases();
    const targetReleases = releaseId ? releases.filter(r => r.id === releaseId) : releases;

    const headers = [
      'Report_Month',
      'Release_ID',
      'ISRC',
      'UPC',
      'Track_Title',
      'Artist_Name',
      'DSP_Store',
      'Territory',
      'Stream_Type',
      'Total_Units_Streams',
      'Gross_Revenue_USD',
      'DSP_Fee_USD',
      'Net_Artist_Payout_USD'
    ];

    const rows: string[] = [headers.join(',')];
    const currentMonth = new Date().toISOString().substring(0, 7);

    targetReleases.forEach(rel => {
      Object.entries(rel.stats.byDsp || {}).forEach(([dspKey, dspData]) => {
        const gross = dspData.earningsUsd * 1.15; // 15% DSP margin
        const fee = dspData.earningsUsd * 0.15;
        rows.push([
          `"${currentMonth}"`,
          `"${rel.id}"`,
          `"${rel.isrc}"`,
          `"${rel.upc}"`,
          `"${rel.title.replace(/"/g, '""')}"`,
          `"${rel.artistName.replace(/"/g, '""')}"`,
          `"${dspKey.toUpperCase()}"`,
          `"GLOBAL"`,
          `"Premium_Interactive_Stream"`,
          dspData.streams.toString(),
          gross.toFixed(4),
          fee.toFixed(4),
          dspData.earningsUsd.toFixed(4)
        ].join(','));
      });
    });

    return rows.join('\n');
  }
}
