import { create } from "zustand";
type History = {
    message:string,
    answer:string
}
type NoteState = {
  history: History
  seledtedAnswer:string
};

type NoteAction = {
    changeNote : (history:History) => void;
    changeAnswer : (answer:string) => void
}

type NoteStore = NoteState & NoteAction

export const defaultInitState: NoteState = {
  history:{
    message:'',
    answer:''
  },
  seledtedAnswer:''
  }

export const noteStore = create<NoteStore>((set,state) => ({
    ...defaultInitState,
    changeNote: (history:History) => set(()=> ({...state,history})),
  changeAnswer: (answer:string) => set(()=> ({...state,seledtedAnswer:answer}))
}));

