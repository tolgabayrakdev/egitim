# Görev Status İş Akışı Önerisi

## Mevcut Statuslar ve Anlamları

1. **pending** (Beklemede)
   - Görev oluşturuldu, henüz başlanmadı
   - Professional tarafından oluşturulduğunda otomatik olarak bu status'ta

2. **in_progress** (Devam Ediyor)
   - Participant göreve başladı
   - Participant manuel olarak başlatabilir veya ilk submission'da otomatik geçer

3. **submitted** (Gönderildi)
   - Participant görevi tamamlayıp gönderdi
   - Professional'ın değerlendirmesini bekliyor

4. **completed** (Tamamlandı)
   - Professional gönderimi onayladı
   - Görev başarıyla tamamlandı

5. **overdue** (Gecikmiş)
   - Due date geçti ama görev henüz tamamlanmadı
   - Otomatik kontrol edilmeli (cron job veya frontend'de kontrol)

6. **cancelled** (İptal Edildi)
   - Professional görevi iptal etti
   - Artık aktif değil

## Önerilen İş Akışı

### Senaryo 1: Normal Akış
```
pending → in_progress → submitted → completed
```

1. **Professional görev oluşturur** → `pending`
2. **Participant göreve başlar** → `in_progress` (manuel veya ilk submission'da)
3. **Participant görevi gönderir** → `submitted`
4. **Professional onaylar** → `completed`

### Senaryo 2: Revizyon Gerektiğinde
```
pending → in_progress → submitted → in_progress → submitted → completed
```

1. **Professional görev oluşturur** → `pending`
2. **Participant göreve başlar** → `in_progress`
3. **Participant görevi gönderir** → `submitted`
4. **Professional "revizyon gerekli" der** → `in_progress` (otomatik)
5. **Participant tekrar gönderir** → `submitted`
6. **Professional onaylar** → `completed`

### Senaryo 3: Gecikme Durumu
```
pending → in_progress → overdue → submitted → completed
```

1. **Professional görev oluşturur** (due_date ile) → `pending`
2. **Participant göreve başlar** → `in_progress`
3. **Due date geçer** → `overdue` (otomatik kontrol)
4. **Participant görevi gönderir** → `submitted`
5. **Professional onaylar** → `completed`

### Senaryo 4: İptal Durumu
```
pending → cancelled
in_progress → cancelled
submitted → cancelled (nadir, ama mümkün)
```

## Önerilen İyileştirmeler

### 1. Participant için "Göreve Başla" Butonu
- Participant göreve başladığında status'u `pending` → `in_progress` yapabilmeli
- Veya ilk submission'da otomatik `in_progress` olabilir

### 2. Overdue Otomatik Kontrolü
- Backend'de cron job veya frontend'de periyodik kontrol
- Due date geçmiş ve status `pending` veya `in_progress` ise → `overdue`

### 3. Status Geçiş Kuralları
- Professional her status'a geçiş yapabilir (tam kontrol)
- Participant sadece:
  - `pending` → `in_progress` (başlatma)
  - `in_progress` → `submitted` (gönderme)
  - `in_progress` → `in_progress` (revizyon sonrası tekrar başlatma)

### 4. UI İyileştirmeleri
- Status badge'lerinde tooltip ile açıklama
- Status geçiş geçmişi (activity log'dan)
- Overdue görevler için uyarı bildirimi

## Mevcut Durum vs Önerilen

### Mevcut Durum:
- ✅ Professional status yönetebilir (yeni eklendi)
- ✅ Participant görev gönderebilir → `submitted`
- ✅ Professional review edebilir → `completed` veya `in_progress`
- ❌ Participant göreve başladığını belirtemez
- ❌ Overdue otomatik kontrolü yok
- ❌ Status geçiş kuralları net değil

### Önerilen:
- ✅ Professional tam kontrol
- ✅ Participant "başlat" ve "gönder" aksiyonları
- ✅ Overdue otomatik kontrol
- ✅ Net status geçiş kuralları
- ✅ Daha iyi UX

