import React, { useState } from "react";
import { recipes, recipeCategories, cuisineCategories, jpSubcategories, krSubcategories, lifeTips, repairTips, bugTips, emergencyTips } from "../data/lifestyle.js";

// ── 카테고리 목록 ──
const CATEGORIES = [
  { key: "home", emoji: "🏠", label: "생활", sub: "" },
  { key: "recipe", emoji: "🍳", label: "뭐 해먹지", sub: "집에서 직접 해먹는 레시피" },
  { key: "lifetip", emoji: "🧹", label: "생활 꿀팁", sub: "알아두면 인생이 편해지는" },
  { key: "repair", emoji: "🛠️", label: "셀프 수리", sub: "업체 부르기 전에 시도해봐" },
  { key: "bug", emoji: "🐛", label: "벌레 퇴치", sub: "침착하게 대처하는 법" },
  { key: "emergency", emoji: "🚨", label: "응급 상황", sub: "당황하지 말고 따라해" },
];

export default function Lifestyle() {
  const [screen, setScreen] = useState("home");
  const [recipeCat, setRecipeCat] = useState("all");
  const [cuisineFilter, setCuisineFilter] = useState("all");
  const [jpSub, setJpSub] = useState("all");
  const [krSub, setKrSub] = useState("all");
  const [openTip, setOpenTip] = useState(null);
  const [openRecipe, setOpenRecipe] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // ── 레시피 필터 ──
  let filteredRecipes = recipes;
  // 국가별 필터
  if (cuisineFilter !== "all") {
    filteredRecipes = filteredRecipes.filter(r => r.cuisine === cuisineFilter);
  }
  // 카테고리 필터
  if (recipeCat !== "all") {
    filteredRecipes = filteredRecipes.filter(r => r.category === recipeCat);
  }
  // 일식 하위 카테고리
  if (cuisineFilter === "일식" && jpSub !== "all") {
    filteredRecipes = filteredRecipes.filter(r => r.subcategory === jpSub);
  }
  // 한식 하위 카테고리
  if (cuisineFilter === "한식" && krSub !== "all") {
    filteredRecipes = filteredRecipes.filter(r => r.category === krSub);
  }

  // ── 팁 검색 ──
  function getAllTips() {
    return [
      ...lifeTips.map(t => ({ ...t, source: "lifetip" })),
      ...repairTips.map(t => ({ ...t, source: "repair" })),
      ...bugTips.map(t => ({ ...t, source: "bug" })),
      ...emergencyTips.map(t => ({ ...t, source: "emergency" })),
    ];
  }

  function getSearchResults() {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();
    const allTips = getAllTips();
    const allRecipes = recipes.map(r => ({ ...r, source: "recipe" }));
    return [...allTips, ...allRecipes].filter(item =>
      item.title?.toLowerCase().includes(q) ||
      item.name?.toLowerCase().includes(q) ||
      item.content?.toLowerCase().includes(q) ||
      item.tags?.some(t => t.includes(q)) ||
      item.ingredients?.some(i => i.includes(q))
    );
  }

  // ── 공통 스타일 ──
  const cardStyle = {
    background: "var(--bg-card)", borderRadius: 16, padding: "16px 18px",
    cursor: "pointer", border: "1.5px solid rgba(255,255,255,0.12)",
    transition: "transform 0.15s",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  };

  const backBtn = (target = "home") => (
    <button onClick={() => { setScreen(target); setOpenTip(null); setOpenRecipe(null); }} style={{
      background: "transparent", border: "none", fontSize: 13,
      color: "var(--text-dim)", cursor: "pointer", fontFamily: "inherit",
      marginBottom: 16,
    }}>
      ← 뒤로
    </button>
  );

  // ── 난이도 색상 ──
  function diffColor(diff) {
    if (diff === "쉬움") return { bg: "#dcfce7", text: "#16a34a" };
    if (diff === "보통") return { bg: "#fef9c3", text: "#ca8a04" };
    if (diff === "어려움") return { bg: "#fee2e2", text: "#dc2626" };
    return { bg: "#f3f4f6", text: "#6b7280" };
  }

  return (
    <div className="screen fade-in" style={{ paddingTop: 32 }}>

      {/* ── 홈 ── */}
      {screen === "home" && (<>
        <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 4 }}>생활 🏠</div>
        <div style={{ fontSize: 14, color: "var(--text-sub)", marginBottom: 20 }}>자취 생존 가이드</div>

        {/* 검색 */}
        <div style={{ marginBottom: 20 }}>
          <input
            type="text" placeholder="뭐든 검색해봐 (배수구, 계란, 바퀴벌레...)"
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: "100%", padding: "14px 16px", borderRadius: 14,
              border: "1.5px solid var(--text-dim)", background: "var(--bg-card)",
              color: "var(--text-main)", fontSize: 14, fontFamily: "inherit",
              outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* 검색 결과 */}
        {searchQuery.trim() && (() => {
          const results = getSearchResults();
          return (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "var(--text-sub)", marginBottom: 10 }}>
                검색 결과 {results.length}개
              </div>
              {results.length === 0 && (
                <div style={{ fontSize: 14, color: "var(--text-dim)", padding: 20, textAlign: "center" }}>
                  결과가 없어... 다른 키워드로 검색해봐
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {results.slice(0, 10).map(item => (
                  <div key={item.id} onClick={() => {
                    if (item.source === "recipe") { setOpenRecipe(item); setScreen("recipeDetail"); }
                    else { setOpenTip(item); setScreen("tipDetail"); }
                    setSearchQuery("");
                  }} style={cardStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 24 }}>{item.emoji}</span>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-main)" }}>{item.title || item.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                          {item.source === "recipe" ? "레시피" : item.source === "lifetip" ? "생활 꿀팁" : item.source === "repair" ? "셀프 수리" : item.source === "bug" ? "벌레 퇴치" : "응급 상황"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* 카테고리 카드 */}
        {!searchQuery.trim() && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {CATEGORIES.filter(c => c.key !== "home").map(cat => (
              <div key={cat.key} onClick={() => setScreen(cat.key)} style={{
                ...cardStyle, display: "flex", alignItems: "center", gap: 14, padding: "20px 18px",
              }}>
                <span style={{ fontSize: 32 }}>{cat.emoji}</span>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>{cat.label}</div>
                  <div style={{ fontSize: 12, color: "var(--text-sub)", marginTop: 2 }}>{cat.sub}</div>
                </div>
                <span style={{ marginLeft: "auto", fontSize: 16, color: "var(--text-sub)" }}>→</span>
              </div>
            ))}
          </div>
        )}
      </>)}

      {/* ── 레시피 목록 ── */}
      {screen === "recipe" && (<>
        {backBtn()}
        <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>🍳 뭐 해먹지</div>
        <div style={{ fontSize: 13, color: "var(--text-sub)", marginBottom: 12 }}>총 {recipes.length}개 레시피</div>

        {/* 국가별 필터 */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-dim)", marginBottom: 6 }}>국가별</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {cuisineCategories.map(cat => (
              <button key={cat.key} onClick={() => { setCuisineFilter(cat.key); setRecipeCat("all"); setJpSub("all"); setKrSub("all"); }} style={{
                padding: "6px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700,
                border: cuisineFilter === cat.key ? "1.5px solid var(--text-main)" : "1.5px solid var(--text-dim)",
                background: cuisineFilter === cat.key ? "var(--text-main)" : "var(--bg-card)",
                color: cuisineFilter === cat.key ? "var(--bg-main)" : "var(--text-sub)",
                cursor: "pointer", fontFamily: "inherit",
              }}>
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 한식 하위 카테고리 */}
        {cuisineFilter === "한식" && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-dim)", marginBottom: 6 }}>분류</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {krSubcategories.map(cat => (
                <button key={cat.key} onClick={() => { setKrSub(cat.key); setRecipeCat("all"); }} style={{
                  padding: "6px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700,
                  border: krSub === cat.key ? "1.5px solid var(--text-main)" : "1.5px solid var(--text-dim)",
                  background: krSub === cat.key ? "var(--text-main)" : "var(--bg-card)",
                  color: krSub === cat.key ? "var(--bg-main)" : "var(--text-sub)",
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 일식 하위 카테고리 */}
        {cuisineFilter === "일식" && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-dim)", marginBottom: 6 }}>분류</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {jpSubcategories.map(cat => (
                <button key={cat.key} onClick={() => setJpSub(cat.key)} style={{
                  padding: "6px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700,
                  border: jpSub === cat.key ? "1.5px solid var(--text-main)" : "1.5px solid var(--text-dim)",
                  background: jpSub === cat.key ? "var(--text-main)" : "var(--bg-card)",
                  color: jpSub === cat.key ? "var(--bg-main)" : "var(--text-sub)",
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 용도별 필터 */}
        {cuisineFilter === "all" && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-dim)", marginBottom: 6 }}>용도별</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {recipeCategories.map(cat => (
                <button key={cat.key} onClick={() => setRecipeCat(cat.key)} style={{
                  padding: "6px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700,
                  border: recipeCat === cat.key ? "1.5px solid var(--text-main)" : "1.5px solid var(--text-dim)",
                  background: recipeCat === cat.key ? "var(--text-main)" : "var(--bg-card)",
                  color: recipeCat === cat.key ? "var(--bg-main)" : "var(--text-sub)",
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 필터 결과 수 */}
        <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 12 }}>
          {filteredRecipes.length}개 레시피
        </div>

        {/* 레시피 카드 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filteredRecipes.map(r => {
            const dc = diffColor(r.difficulty);
            return (
              <div key={r.id} onClick={() => { setOpenRecipe(r); setScreen("recipeDetail"); }} style={{
                ...cardStyle, display: "flex", alignItems: "center", gap: 14,
              }}>
                <span style={{ fontSize: 32 }}>{r.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-main)" }}>{r.name}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                    <span style={{
                      padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 600,
                      background: dc.bg, color: dc.text,
                    }}>{r.difficulty}</span>
                    <span style={{
                      padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 600,
                      background: "#eff6ff", color: "#3b82f6",
                    }}>{r.time}분</span>
                    <span style={{
                      padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 600,
                      background: "#f3f4f6", color: "#6b7280",
                    }}>{r.servings}인분</span>
                  </div>
                </div>
                <span style={{ fontSize: 16, color: "var(--text-dim)" }}>→</span>
              </div>
            );
          })}
        </div>
      </>)}

      {/* ── 레시피 상세 ── */}
      {screen === "recipeDetail" && openRecipe && (<>
        {backBtn("recipe")}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>{openRecipe.emoji}</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "var(--text-main)" }}>{openRecipe.name}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 8 }}>
            {(() => { const dc = diffColor(openRecipe.difficulty); return (
              <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: dc.bg, color: dc.text }}>{openRecipe.difficulty}</span>
            );})()}
            <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: "#eff6ff", color: "#3b82f6" }}>{openRecipe.time}분</span>
            <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: "#f3f4f6", color: "#6b7280" }}>{openRecipe.servings}인분</span>
          </div>
        </div>

        {/* 재료 */}
        <div style={{ ...cardStyle, marginBottom: 12, cursor: "default" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-main)", marginBottom: 10 }}>📝 재료</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {openRecipe.ingredients.map((ing, i) => (
              <span key={i} style={{
                padding: "6px 12px", borderRadius: 10,
                background: "var(--bg-main)", fontSize: 13, color: "#fff",
                fontWeight: 600,
              }}>{ing}</span>
            ))}
          </div>
        </div>

        {/* 만드는 법 */}
        <div style={{ ...cardStyle, marginBottom: 12, cursor: "default" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-main)", marginBottom: 10 }}>👨‍🍳 만드는 법</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {openRecipe.steps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{
                  minWidth: 20, fontSize: 14, fontWeight: 800, flexShrink: 0,
                  color: "#fff", paddingTop: 1,
                }}>{i + 1}.</span>
                <span style={{ fontSize: 14, color: "#fff", lineHeight: 1.6, paddingTop: 1, fontWeight: 500 }}>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 유튜브/만개의레시피 연결 */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(openRecipe.name + " 레시피")}`, "_blank")} style={{
            flex: 1, padding: "14px 10px", background: "#FF0000", color: "#fff",
            border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            ▶ 유튜브에서 보기
          </button>
          <button onClick={() => window.open(`https://www.10000recipe.com/recipe/list.html?q=${encodeURIComponent(openRecipe.name)}`, "_blank")} style={{
            flex: 1, padding: "14px 10px", background: "#4CAF50", color: "#fff",
            border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            📖 만개의레시피
          </button>
        </div>

        {/* 태그 */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
          {openRecipe.tags.map(tag => (
            <span key={tag} style={{
              padding: "4px 10px", borderRadius: 100, fontSize: 11,
              fontWeight: 600, background: "var(--bg-card)", color: "var(--text-dim)",
            }}>#{tag}</span>
          ))}
        </div>
      </>)}

      {/* ── 팁 목록 (자취꿀팁 / 셀프수리 / 벌레퇴치 / 응급상황) ── */}
      {["lifetip", "repair", "bug", "emergency"].includes(screen) && (() => {
        const tipMap = {
          lifetip: { data: lifeTips, title: "🧹 생활 꿀팁", sub: "알아두면 인생이 편해지는" },
          repair: { data: repairTips, title: "🛠️ 셀프 수리", sub: "업체 부르기 전에 시도해봐" },
          bug: { data: bugTips, title: "🐛 벌레 퇴치", sub: "침착하게 대처하는 법" },
          emergency: { data: emergencyTips, title: "🚨 응급 상황", sub: "당황하지 말고 따라해" },
        };
        const { data, title, sub } = tipMap[screen];
        return (<>
          {backBtn()}
          <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 13, color: "var(--text-sub)", marginBottom: 20 }}>{sub}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.map(tip => (
              <div key={tip.id} onClick={() => { setOpenTip(tip); setScreen("tipDetail"); }} style={{
                ...cardStyle, display: "flex", alignItems: "center", gap: 14,
              }}>
                <span style={{ fontSize: 28 }}>{tip.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{tip.title}</div>
                  <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                    {tip.tags.map(tag => (
                      <span key={tag} style={{
                        padding: "2px 7px", borderRadius: 99, fontSize: 10,
                        fontWeight: 600, background: "rgba(255,255,255,0.08)", color: "var(--text-sub)",
                      }}>#{tag}</span>
                    ))}
                  </div>
                </div>
                <span style={{ fontSize: 16, color: "var(--text-sub)" }}>→</span>
              </div>
            ))}
          </div>
        </>);
      })()}

      {/* ── 팁 상세 ── */}
      {screen === "tipDetail" && openTip && (<>
        {backBtn(openTip.source || "home")}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>{openTip.emoji}</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "var(--text-main)" }}>{openTip.title}</div>
        </div>
        <div style={{ ...cardStyle, cursor: "default", marginBottom: 16, border: "1.5px solid rgba(255,255,255,0.15)", background: "var(--bg-card-hover)" }}>
          <div style={{
            fontSize: 15, color: "#fff", lineHeight: 1.9,
            whiteSpace: "pre-line", fontWeight: 500,
          }}>
            {openTip.content}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
          {openTip.tags.map(tag => (
            <span key={tag} style={{
              padding: "4px 10px", borderRadius: 100, fontSize: 11,
              fontWeight: 600, background: "var(--bg-card)", color: "var(--text-dim)",
            }}>#{tag}</span>
          ))}
        </div>
        {/* 유튜브 검색 연결 */}
        <button onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(openTip.title)}`, "_blank")} style={{
          width: "100%", padding: "14px", background: "#FF0000", color: "#fff",
          border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700,
          cursor: "pointer", fontFamily: "inherit", marginBottom: 12,
        }}>
          ▶ 유튜브에서 더 알아보기
        </button>
      </>)}

    </div>
  );
}
