import { isSupabaseConfigured, supabase } from './supabase';

const VISA_STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_VISA_BUCKET || 'visa-documents';

const createLocalRecord = (storageKey: string, record: Record<string, unknown>) => {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  const next = [record, ...saved];
  localStorage.setItem(storageKey, JSON.stringify(next));
  return record;
};

export const uploadVisaDocument = async (userId: string, documentType: 'passport' | 'photograph', file: File) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase storage is not configured for visa uploads.');
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filePath = `${userId}/${documentType}_${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from(VISA_STORAGE_BUCKET)
    .upload(filePath, file, { upsert: false, contentType: file.type });

  if (error) {
    if (error.message.toLowerCase().includes('bucket')) {
      throw new Error(`Visa upload failed: bucket "${VISA_STORAGE_BUCKET}" was not found or is not accessible.`);
    }
    throw error;
  }

  const { data } = supabase.storage.from(VISA_STORAGE_BUCKET).getPublicUrl(filePath);

  return {
    bucket: VISA_STORAGE_BUCKET,
    path: filePath,
    publicUrl: data.publicUrl
  };
};

export const saveVisaApplication = async (record: Record<string, unknown>) => {
  const localId = `VISA-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  const localRecord = {
    id: localId,
    created_at: new Date().toISOString(),
    ...record
  };

  if (!isSupabaseConfigured()) {
    return createLocalRecord('sb_visa_applications', localRecord);
  }

  const { data, error } = await supabase
    .from('visa_applications')
    .insert([record])
    .select()
    .single();

  if (!error) {
    return data;
  }

  if (error.message.toLowerCase().includes('column')) {
    const fallbackRecord = {
      user_id: record.user_id,
      country: record.country,
      full_name: record.full_name,
      passport_number: record.passport_number,
      email: record.email,
      phone: record.phone,
      travel_date: record.travel_date,
      purpose: record.purpose,
      status: record.status,
      fee: record.fee
    };

    const { data: fallbackData, error: fallbackError } = await supabase
      .from('visa_applications')
      .insert([fallbackRecord])
      .select()
      .single();

    if (!fallbackError) {
      return fallbackData;
    }
  }

  return createLocalRecord('sb_visa_applications', localRecord);
};

export const saveInsurancePolicy = async (record: Record<string, unknown>) => {
  const localId = `POL-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  const localRecord = {
    id: localId,
    created_at: new Date().toISOString(),
    ...record
  };

  if (!isSupabaseConfigured()) {
    return createLocalRecord('sb_insurance_policies', localRecord);
  }

  const { data, error } = await supabase
    .from('insurance_policies')
    .insert([record])
    .select()
    .single();

  if (!error) {
    return data;
  }

  return createLocalRecord('sb_insurance_policies', localRecord);
};

export const getVisaApplicationsForUser = async (userId: string) => {
  if (!userId) {
    return [];
  }

  const localRecords = JSON.parse(localStorage.getItem('sb_visa_applications') || '[]');
  const localFiltered = localRecords.filter((item: any) => item.user_id === userId);

  if (!isSupabaseConfigured()) {
    return localFiltered;
  }

  const { data, error } = await supabase
    .from('visa_applications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return localFiltered;
  }

  return data || [];
};

export const getInsurancePoliciesForUser = async (userId: string) => {
  if (!userId) {
    return [];
  }

  const localRecords = JSON.parse(localStorage.getItem('sb_insurance_policies') || '[]');
  const localFiltered = localRecords.filter((item: any) => item.user_id === userId);

  if (!isSupabaseConfigured()) {
    return localFiltered;
  }

  const { data, error } = await supabase
    .from('insurance_policies')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return localFiltered;
  }

  return data || [];
};

export const cancelVisaApplication = async (applicationId: string, userId: string) => {
  const localRecords = JSON.parse(localStorage.getItem('sb_visa_applications') || '[]');
  const updatedLocal = localRecords.map((item: any) =>
    item.id === applicationId && item.user_id === userId
      ? { ...item, status: 'cancelled' }
      : item
  );
  localStorage.setItem('sb_visa_applications', JSON.stringify(updatedLocal));

  if (!isSupabaseConfigured()) {
    return true;
  }

  const { error } = await supabase
    .from('visa_applications')
    .update({ status: 'cancelled' })
    .eq('id', applicationId)
    .eq('user_id', userId);

  return !error;
};

export const cancelInsurancePolicy = async (policyId: string, userId: string) => {
  const localRecords = JSON.parse(localStorage.getItem('sb_insurance_policies') || '[]');
  const updatedLocal = localRecords.map((item: any) =>
    item.id === policyId && item.user_id === userId
      ? { ...item, status: 'cancelled' }
      : item
  );
  localStorage.setItem('sb_insurance_policies', JSON.stringify(updatedLocal));

  if (!isSupabaseConfigured()) {
    return true;
  }

  const { error } = await supabase
    .from('insurance_policies')
    .update({ status: 'cancelled' })
    .eq('id', policyId)
    .eq('user_id', userId);

  return !error;
};
