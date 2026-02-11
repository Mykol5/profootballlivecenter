// src/lib/api.ts
import { FootballMatch, MatchDetail } from "./types";

const API_BASE_URL = ''; // Empty for relative URLs
const USE_PROXY = true; // Set to true to use Next.js API proxy

export async function fetchMatches(): Promise<{ 
  success: boolean; 
  data: { matches: FootballMatch[]; total: number } 
}> {
  try {
    const url = USE_PROXY 
      ? '/api/proxy/matches' 
      : 'https://profootball.srv883830.hstgr.cloud/api/matches';
    
    console.log('Fetching matches from:', url);
    
    const response = await fetch(url, {
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Matches fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error fetching matches:', error);
    return {
      success: false,
      data: { matches: [], total: 0 }
    };
  }
}

export async function fetchLiveMatches(): Promise<{ 
  success: boolean; 
  data: { matches: FootballMatch[]; total: number } 
}> {
  try {
    const url = USE_PROXY 
      ? '/api/proxy/matches/live' 
      : 'https://profootball.srv883830.hstgr.cloud/api/matches/live';
    
    console.log('Fetching live matches from:', url);
    
    const response = await fetch(url, {
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Live matches fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error fetching live matches:', error);
    return {
      success: false,
      data: { matches: [], total: 0 }
    };
  }
}

export async function fetchMatch(id: string): Promise<{ 
  success: boolean; 
  data: MatchDetail | null 
}> {
  try {
    const url = USE_PROXY 
      ? `/api/proxy/matches/${id}` 
      : `https://profootball.srv883830.hstgr.cloud/api/matches/${id}`;
    
    console.log('Fetching match details from:', url);
    
    const response = await fetch(url, {
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch match: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Match details fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error fetching match details:', error);
    return {
      success: false,
      data: null
    };
  }
}




// // src/lib/api.ts
// import { FootballMatch, MatchDetail } from "./types";

// const API_BASE_URL = 'https://profootball.srv883830.hstgr.cloud';

// // Helper function to handle fetch with timeout and better error handling
// async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000) {
//   const controller = new AbortController();
//   const id = setTimeout(() => controller.abort(), timeout);
  
//   try {
//     const response = await fetch(url, {
//       ...options,
//       signal: controller.signal,
//       mode: 'cors',
//       credentials: 'omit',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         ...options.headers,
//       },
//     });
//     clearTimeout(id);
//     return response;
//   } catch (error) {
//     clearTimeout(id);
//     throw error;
//   }
// }

// export async function fetchHealth(): Promise<{ success: boolean }> {
//   try {
//     const response = await fetchWithTimeout(`${API_BASE_URL}/health`);
//     return await response.json();
//   } catch (error) {
//     console.error('Health check failed:', error);
//     return { success: false };
//   }
// }

// export async function fetchMatches(): Promise<{ 
//   success: boolean; 
//   data: { matches: FootballMatch[]; total: number } 
// }> {
//   try {
//     console.log('Fetching matches from:', `${API_BASE_URL}/api/matches`);
    
//     const response = await fetchWithTimeout(`${API_BASE_URL}/api/matches`, {
//       cache: 'no-store',
//       next: { revalidate: 0 },
//     });
    
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
    
//     const data = await response.json();
//     console.log('Matches fetched successfully:', data);
//     return data;
//   } catch (error) {
//     console.error('Error fetching matches:', error);
//     // Return empty array instead of throwing
//     return {
//       success: false,
//       data: { matches: [], total: 0 }
//     };
//   }
// }

// export async function fetchLiveMatches(): Promise<{ 
//   success: boolean; 
//   data: { matches: FootballMatch[]; total: number } 
// }> {
//   try {
//     console.log('Fetching live matches from:', `${API_BASE_URL}/api/matches/live`);
    
//     const response = await fetchWithTimeout(`${API_BASE_URL}/api/matches/live`, {
//       cache: 'no-store',
//       next: { revalidate: 0 },
//     });
    
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
    
//     const data = await response.json();
//     console.log('Live matches fetched successfully:', data);
//     return data;
//   } catch (error) {
//     console.error('Error fetching live matches:', error);
//     return {
//       success: false,
//       data: { matches: [], total: 0 }
//     };
//   }
// }

// export async function fetchMatch(id: string): Promise<{ 
//   success: boolean; 
//   data: MatchDetail | null 
// }> {
//   try {
//     console.log('Fetching match details for ID:', id);
    
//     const response = await fetchWithTimeout(`${API_BASE_URL}/api/matches/${id}`, {
//       cache: 'no-store',
//       next: { revalidate: 0 },
//     });
    
//     if (!response.ok) {
//       throw new Error(`Failed to fetch match: ${response.statusText}`);
//     }
    
//     const data = await response.json();
//     console.log('Match details fetched successfully:', data);
//     return data;
//   } catch (error) {
//     console.error('Error fetching match details:', error);
//     return {
//       success: false,
//       data: null
//     };
//   }
// }





// // lib/api.ts
// import { FootballMatch, MatchDetail } from "./types";  // CORRECT - Import from your types

// const API_BASE_URL = 'https://profootball.srv883830.hstgr.cloud';

// export async function fetchHealth(): Promise<{ success: boolean }> {
//   const response = await fetch(`${API_BASE_URL}/health`);
//   return response.json();
// }

// export async function fetchMatches(): Promise<{ 
//   success: boolean; 
//   data: { matches: FootballMatch[]; total: number }  // Use FootballMatch
// }> {
//   const response = await fetch(`${API_BASE_URL}/api/matches`, {
//     cache: 'no-store',
//     next: { revalidate: 0 }
//   });
//   return response.json();
// }

// export async function fetchLiveMatches(): Promise<{ 
//   success: boolean; 
//   data: { matches: FootballMatch[]; total: number }  // Use FootballMatch
// }> {
//   const response = await fetch(`${API_BASE_URL}/api/matches/live`, {
//     cache: 'no-store',
//     next: { revalidate: 0 }
//   });
//   return response.json();
// }

// export async function fetchMatch(id: string): Promise<{ 
//   success: boolean; 
//   data: MatchDetail 
// }> {
//   const response = await fetch(`${API_BASE_URL}/api/matches/${id}`, {
//     cache: 'no-store',
//     next: { revalidate: 0 }
//   });
  
//   if (!response.ok) {
//     throw new Error(`Failed to fetch match: ${response.statusText}`);
//   }
  
//   return response.json();
// }