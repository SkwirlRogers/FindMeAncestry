from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pathlib import Path
import sqlite3, pandas as pd

DB = 'genealogy_seed.sqlite'
app = FastAPI(title='Genealogy Hub Backend')
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])


def q(sql, params=()):
    with sqlite3.connect(DB) as conn:
        return pd.read_sql_query(sql, conn, params=params).to_dict(orient='records')

@app.get('/health')
def health():
    return {'ok': True}

@app.get('/states')
def states():
    return q('select * from states order by state_name')

@app.get('/jurisdictions')
def jurisdictions(search: str = '', state_abbr: str = '', jurisdiction_type: str = '', status: str = ''):
    sql = 'select * from jurisdictions where 1=1'
    params = []
    if search:
        sql += ' and (jurisdiction_name like ? or notes like ? or boundary_change_notes like ? or renamed_from like ? or renamed_to like ?)'
        params += [f'%{search}%', f'%{search}%', f'%{search}%', f'%{search}%', f'%{search}%']
    if state_abbr:
        sql += ' and state_abbr = ?'
        params.append(state_abbr)
    if jurisdiction_type:
        sql += ' and jurisdiction_type = ?'
        params.append(jurisdiction_type)
    if status:
        sql += ' and status_current_or_former = ?'
        params.append(status)
    sql += ' order by state_name, jurisdiction_name limit 10000'
    return q(sql, tuple(params))

@app.get('/jurisdiction/{jurisdiction_id}')
def jurisdiction(jurisdiction_id: str):
    rows = q('select * from jurisdictions where jurisdiction_id = ?', (jurisdiction_id,))
    if not rows:
        raise HTTPException(status_code=404, detail='Not found')
    return rows[0]

@app.get('/timeline')
def timeline(state_abbr: str = '', jurisdiction_name: str = ''):
    sql = 'select * from jurisdiction_changes where 1=1'
    params = []
    if state_abbr:
        sql += ' and state_abbr = ?'
        params.append(state_abbr)
    if jurisdiction_name:
        sql += ' and (old_name like ? or new_name like ? or notes like ?)'
        params += [f'%{jurisdiction_name}%', f'%{jurisdiction_name}%', f'%{jurisdiction_name}%']
    sql += ' order by effective_date desc, change_id desc limit 5000'
    return q(sql, tuple(params))

@app.get('/resource-links')
def resource_links(state_abbr: str = ''):
    if state_abbr:
        return q('select * from resource_links where state_abbr = ? order by resource_type, title', (state_abbr,))
    return q('select * from resource_links order by state_abbr, resource_type, title limit 10000')

@app.get('/', response_class=HTMLResponse)
def root():
    return '<h1>Genealogy Hub API</h1>'