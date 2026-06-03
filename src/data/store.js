import { supabase } from '../supabase';

// Real-time listener
export function subscribeToTransactions(callback) {
  // Initial fetch
  supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
    .then(({ data }) => callback(data || []));

  // Listen for changes
  const channel = supabase
    .channel('transactions')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'transactions' },
      () => {
        supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false })
          .then(({ data }) => callback(data || []));
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

// Add
export async function addTransaction(tx) {
  await supabase.from('transactions').insert([tx]);
}

// Update
export async function updateTransaction(id, changes) {
  await supabase.from('transactions').update(changes).eq('id', id);
}

// Delete
export async function deleteTransaction(id) {
  await supabase.from('transactions').delete().eq('id', id);
}