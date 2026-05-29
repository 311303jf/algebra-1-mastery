/* ============================================================
   Algebra OS — Misconception Tracking Engine 1.0
   File: engine/misconceptionEngine.js
   ============================================================ */

const STORAGE_KEY = "algebra_misconceptions";

function loadData(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  }catch{
    return {};
  }
}

function saveData(data){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function record(lessonId, problemType, misconception){
  const data = loadData();

  if(!data[problemType]){
    data[problemType] = {
      count: 0,
      lessons: {},
      misconceptionText: misconception || ""
    };
  }

  data[problemType].count += 1;
  data[problemType].misconceptionText = misconception || data[problemType].misconceptionText;

  if(!data[problemType].lessons[lessonId]){
    data[problemType].lessons[lessonId] = 0;
  }

  data[problemType].lessons[lessonId] += 1;

  saveData(data);
  return data;
}

function getAll(){
  return loadData();
}

function getWeakestConcepts(limit = 5){
  const data = loadData();

  return Object.entries(data)
    .map(([problemType, info]) => ({
      problemType,
      count: info.count || 0,
      misconceptionText: info.misconceptionText || ""
    }))
    .sort((a,b) => b.count - a.count)
    .slice(0, limit);
}

function clear(){
  localStorage.removeItem(STORAGE_KEY);
}

window.AlgebraMisconceptionEngine = {
  record,
  getAll,
  getWeakestConcepts,
  clear
};
