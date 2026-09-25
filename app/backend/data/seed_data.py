"""
Módulo seed_data em app/backend/data/
Permite execução e acesso aos dados mock a partir do diretório data.
"""

from mock.seed_mock_data import get_mock_data, seed_database, export_json

if __name__ == "__main__":
    import sys
    force_run = "--force" in sys.argv
    export_json()
    seed_database(force=force_run)
