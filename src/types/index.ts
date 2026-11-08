export interface Student {
  id: string;
  studentName: string;
  competitionIdea: string;
  moduleUrl: string;
  sb3FileUrl: string;
  createdAt: string;
  moduleFileName?: string;
  sb3FileName?: string;
  moduleFileKey?: string;
  sb3FileKey?: string;
  category?: string;
  grade?: string;
}

export interface FirebaseConfigType {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
