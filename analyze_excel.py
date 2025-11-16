import zipfile
import xml.etree.ElementTree as ET

# Open xlsx as zip
with zipfile.ZipFile('Formulaire accompagnement projets.xlsx', 'r') as z:
    # Get workbook to find sheet names
    wb_xml = z.read('xl/workbook.xml')
    wb_root = ET.fromstring(wb_xml)

    ns = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    sheets = wb_root.findall('.//main:sheet', ns)

    print("=== SHEETS ===")
    for sheet in sheets:
        print(f"Sheet: {sheet.get('name')} (rId: {sheet.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')})")

    # Parse shared strings
    try:
        ss_xml = z.read('xl/sharedStrings.xml')
        ss_root = ET.fromstring(ss_xml)
        shared_strings = []
        for si in ss_root.findall('.//main:si', ns):
            t = si.find('.//main:t', ns)
            if t is not None and t.text:
                shared_strings.append(t.text)
            else:
                shared_strings.append('')
    except:
        shared_strings = []

    # Read styles to identify yellow fills
    styles_xml = z.read('xl/styles.xml')
    styles_root = ET.fromstring(styles_xml)

    fills = styles_root.findall('.//main:fill', ns)
    yellow_fill_ids = []

    print("\n=== FILLS (looking for yellow) ===")
    for idx, fill in enumerate(fills):
        fg_color = fill.find('.//main:fgColor', ns)
        if fg_color is not None:
            rgb = fg_color.get('rgb', '')
            theme = fg_color.get('theme', '')
            print(f"Fill {idx}: rgb={rgb}, theme={theme}")
            # Yellow variations
            if rgb and ('FFFF' in rgb or 'FFE5' in rgb or 'FFF' in rgb[:4]):
                yellow_fill_ids.append(idx)
                print(f"  -> YELLOW DETECTED")

    # Map cell formats to fill IDs
    cell_xfs = styles_root.findall('.//main:cellXfs/main:xf', ns)
    yellow_style_ids = []

    print("\n=== CELL FORMATS (with yellow fills) ===")
    for idx, xf in enumerate(cell_xfs):
        fill_id = int(xf.get('fillId', 0))
        if fill_id in yellow_fill_ids:
            yellow_style_ids.append(idx)
            print(f"Style {idx}: fillId={fill_id} -> YELLOW")

    # Now read sheets and identify yellow cells
    for i in range(1, 10):
        try:
            sheet_xml = z.read(f'xl/worksheets/sheet{i}.xml')
            sheet_root = ET.fromstring(sheet_xml)

            print(f"\n=== SHEET {i} DATA ===")

            rows = sheet_root.findall('.//main:row', ns)
            for row in rows[:100]:  # First 100 rows
                cells = row.findall('.//main:c', ns)
                for cell in cells:
                    ref = cell.get('r', '')
                    style_id = int(cell.get('s', 0))
                    value_elem = cell.find('.//main:v', ns)
                    cell_type = cell.get('t', '')

                    if value_elem is not None:
                        value = value_elem.text
                        # If shared string
                        if cell_type == 's':
                            try:
                                value = shared_strings[int(value)]
                            except:
                                pass

                        is_yellow = style_id in yellow_style_ids
                        if is_yellow or (value and len(str(value)) > 0):
                            marker = " [YELLOW INPUT]" if is_yellow else ""
                            print(f"{ref}: {value}{marker}")
        except KeyError:
            break
